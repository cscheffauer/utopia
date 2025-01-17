{-# LANGUAGE AllowAmbiguousTypes    #-}
{-# LANGUAGE DuplicateRecordFields  #-}
{-# LANGUAGE FlexibleContexts       #-}
{-# LANGUAGE FunctionalDependencies #-}
{-# LANGUAGE MultiParamTypeClasses  #-}
{-# LANGUAGE OverloadedStrings      #-}
{-# LANGUAGE RecordWildCards        #-}
{-# LANGUAGE TypeFamilies           #-}

module Utopia.Web.Executors.Common where

import           Conduit
import           Control.Concurrent.ReadWriteLock
import           Control.Lens                     hiding ((.=), (<.>))
import           Control.Monad.Catch              hiding (Handler, catch)
import           Control.Monad.RWS.Strict
import           Data.Aeson
import           Data.Binary.Builder
import qualified Data.ByteString.Lazy             as BL
import           Data.Conduit.Combinators         hiding (foldMap)
import qualified Data.HashMap.Strict              as M
import           Data.IORef
import           Data.Pool
import           Data.String                      (String)
import           Data.Time
import           Database.Persist.Sql
import           Network.HTTP.Client              hiding (Response)
import           Network.HTTP.Types.Header
import           Network.HTTP.Types.Status
import           Network.Mime
import           Network.Wai
import qualified Network.Wreq                     as WR
import           Protolude                        hiding (concatMap,
                                                   intersperse, map, sourceFile,
                                                   (<.>))
import           Servant
import           Servant.Client                   hiding (Response)
import           System.Directory
import           System.Environment
import           System.FilePath
import           System.Metrics                   hiding (Value)
import qualified Text.Blaze.Html5                 as H
import           Utopia.Web.Assets
import           Utopia.Web.Auth                  (getUserDetailsFromCode)
import           Utopia.Web.Auth.Session
import           Utopia.Web.Auth.Types            (Auth0Resources)
import qualified Utopia.Web.Database              as DB
import           Utopia.Web.Database.Types
import           Utopia.Web.Packager.Locking
import           Utopia.Web.Packager.NPM
import           Utopia.Web.ServiceTypes
import           Utopia.Web.Types
import           Utopia.Web.Utils.Files
import           Web.Cookie

{-|
  When running the 'ServerMonad' type this is the type that we will
  compute it into which will in turn be invoked. 'RWST' is a <https://en.wikibooks.org/wiki/Haskell/Monad_transformers monad transformer>
  which composes together the Reader, Writer and State monads.
  Note: Currently we don't utilise the writer and state parts.
-}
type ServerProcessMonad r a = RWST r () () Handler a

{-|
  A function which specifies the type of the transformation used to
  compute the 'ServerMonad' into 'ServerProcessMonad'.
-}
type MonadExecutor r a = ServiceCallsF a -> ServerProcessMonad r a

data Environment = Development
                 | Production
                 deriving (Eq, Show)

type Stop = IO ()

data EnvironmentRuntime r = EnvironmentRuntime
  { _initialiseResources :: IO r
  , _startup             :: r -> IO Stop
  , _envServerPort       :: r -> Int
  , _serverAPI           :: r -> Server API
  , _startupLogging      :: r -> Bool
  , _metricsStore        :: r -> Store
  , _cacheForAssets      :: r -> IO AssetResultCache
  , _forceSSL            :: r -> Bool
  }

data AssetsCaches = AssetsCaches
  { _hashCache        :: IORef FileHashDetailsMap
  , _assetResultCache :: IORef AssetResultCache
  , _assetPathDetails :: [PathAndBuilders]
  }

failedAuth0CodeCheck :: (MonadIO m, MonadError ServerError m) => ClientError -> m a
failedAuth0CodeCheck servantError = do
  putErrLn $ (show servantError :: String)
  throwError err500

successfulAuthCheck :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> SessionState -> (Maybe SetCookie -> a) -> UserDetails -> m a
successfulAuthCheck metrics pool sessionState action user = do
  liftIO $ DB.updateUserDetails metrics pool user
  possibleSetCookie <- liftIO $ newSessionForUser sessionState $ userDetailsUserId user
  return $ action possibleSetCookie

auth0CodeCheck :: (MonadIO m, MonadError ServerError m) => DB.DatabaseMetrics -> Pool SqlBackend -> SessionState -> Auth0Resources -> Text -> (Maybe SetCookie -> a) -> m a
auth0CodeCheck metrics pool sessionState auth0Resources authCode action = do
  userOrError <- liftIO $ getUserDetailsFromCode auth0Resources authCode
  either failedAuth0CodeCheck (successfulAuthCheck metrics pool sessionState action) userOrError

validateAuthCookie :: SessionState -> Text -> (Maybe SessionUser -> a) -> IO a
validateAuthCookie sessionState cookie action = do
  maybeUserId <- getUserIdFromCookie sessionState $ Just cookie
  return $ action $ fmap SessionUser maybeUserId

logoutOfSession :: (MonadIO m) => SessionState -> Text -> H.Html -> (SetSessionCookies H.Html -> a) -> m a
logoutOfSession sessionState cookie pageContents action = do
  liftIO $ logoutSession sessionState $ Just cookie
  return $ action $ addHeader (deleteCookie sessionState) pageContents

portFromEnvironment :: IO Int
portFromEnvironment = do
  fromEnvironment <- lookupEnv "PORT"
  let portForEndpoint = fromMaybe 8000 $ do
        envPort <- fromEnvironment
        readMaybe envPort
  return portForEndpoint

userFromUserDetails :: UserDetails -> User
userFromUserDetails userDetails = User
                                { _userId  = userDetailsUserId userDetails
                                , _email   = userDetailsEmail userDetails
                                , _name    = userDetailsName userDetails
                                , _picture = userDetailsPicture userDetails
                                }

getUserWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> (Maybe User -> a) -> m a
getUserWithPool metrics pool userIdToGet action = do
  possibleUserDetails <- liftIO $ DB.getUserDetails metrics pool userIdToGet
  let possibleUser = fmap userFromUserDetails possibleUserDetails
  return $ action possibleUser

loadProjectWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> (Maybe DecodedProject -> a) -> m a
loadProjectWithPool metrics pool projectID action = do
  possibleProject <- liftIO $ DB.loadProject metrics pool projectID
  return $ action possibleProject

createProjectWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> (Text -> a) -> m a
createProjectWithPool metrics pool action = do
  projectID <- liftIO $ DB.createProject metrics pool
  return $ action projectID

saveProjectWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> SessionUser -> Text -> Maybe Text -> Maybe Value -> m ()
saveProjectWithPool metrics pool sessionUser projectID possibleTitle possibleProjectContents = do
  timestamp <- liftIO $ getCurrentTime
  liftIO $ DB.saveProject metrics pool (view id sessionUser) projectID timestamp possibleTitle possibleProjectContents

deleteProjectWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> SessionUser -> Text -> m ()
deleteProjectWithPool metrics pool sessionUser projectID = do
  liftIO $ DB.deleteProject metrics pool (view id sessionUser) projectID

getUserProjectsWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> ([ProjectListing] -> a) -> m a
getUserProjectsWithPool metrics pool user action = do
  projectsForUser <- liftIO $ DB.getProjectsForUser metrics pool user
  let projectListings = fmap listingFromProjectMetadata projectsForUser
  return $ action projectListings

getShowcaseProjectsWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> ([ProjectListing] -> a) -> m a
getShowcaseProjectsWithPool metrics pool action = do
  showcaseProjects <- liftIO $ DB.getShowcaseProjects metrics pool
  let projectListings = fmap listingFromProjectMetadata showcaseProjects
  return $ action projectListings

setShowcaseProjectsWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> [Text] -> a -> m a
setShowcaseProjectsWithPool metrics pool showcaseProjects next = do
  liftIO $ DB.setShowcaseProjects metrics pool showcaseProjects
  return next

whenProjectOwner :: (MonadIO m, MonadThrow m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> Text -> m a -> m a
whenProjectOwner metrics pool user projectID whenOwner = do
  maybeProjectOwner <- liftIO $ DB.getProjectOwner metrics pool projectID
  let correctUser = maybe False (\projectOwner -> projectOwner == user) maybeProjectOwner
  if correctUser then whenOwner else throwM DB.UserIDIncorrectException

saveProjectAssetWithCall :: (MonadIO m, MonadThrow m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> Text -> [Text] -> ([Text] -> BL.ByteString -> IO ()) -> m Application
saveProjectAssetWithCall metrics pool user projectID assetPath saveCall = do
  whenProjectOwner metrics pool user projectID $ return $ \request -> \sendResponse -> do
    asset <- lazyRequestBody request
    saveCall (projectID : assetPath) asset
    sendResponse $ responseLBS ok200 mempty mempty

getPathMimeType :: [Text] -> MimeType
getPathMimeType pathElements = maybe defaultMimeType defaultMimeLookup $ lastOf traverse pathElements

getAssetHeaders :: Maybe [Text] -> Maybe Text -> ResponseHeaders
getAssetHeaders possibleAssetPath possibleETag =
  let mimeTypeHeaders = foldMap (\assetPath -> [(hContentType, getPathMimeType assetPath)]) possibleAssetPath
      etagHeaders = foldMap (\etag -> [(hCacheControl, "public, must-revalidate, proxy-revalidate, max-age=0"), ("ETag", toS etag)]) possibleETag
  in  mimeTypeHeaders <> etagHeaders

responseFromLoadAssetResult :: [Text] -> LoadAssetResult -> Maybe Response
responseFromLoadAssetResult _ AssetUnmodified = Just $ responseLBS notModified304 [] mempty
responseFromLoadAssetResult _ AssetNotFound   = Nothing
responseFromLoadAssetResult assetPath (AssetLoaded bytes possibleETag) =
  let headers = getAssetHeaders (Just assetPath) possibleETag
  in  Just $ responseLBS ok200 headers bytes

loadProjectAssetWithCall :: (MonadIO m, MonadThrow m) => LoadAsset -> [Text] -> Maybe Text -> m (Maybe Application)
loadProjectAssetWithCall loadCall assetPath possibleETag = do
  possibleAsset <- liftIO $ loadCall assetPath possibleETag
  let possibleResponse = responseFromLoadAssetResult assetPath possibleAsset
  pure $ fmap (\response -> \_ -> \sendResponse -> sendResponse response) possibleResponse

renameProjectAssetWithCall :: (MonadIO m, MonadThrow m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> Text -> OldPathText -> NewPathText -> (OldPathText -> NewPathText -> IO ()) -> m ()
renameProjectAssetWithCall metrics pool user projectID (OldPath oldPath) (NewPath newPath) renameCall = do
  whenProjectOwner metrics pool user projectID $ liftIO $ renameCall (OldPath (projectID : oldPath)) (NewPath (projectID : newPath))

deleteProjectAssetWithCall :: (MonadIO m, MonadThrow m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> Text -> [Text] -> ([Text] -> IO ()) -> m()
deleteProjectAssetWithCall metrics pool user projectID assetPath deleteCall = do
  whenProjectOwner metrics pool user projectID $ liftIO $ deleteCall (projectID : assetPath)

responseFromLoadThumbnailResult :: LoadAssetResult -> Maybe Response
responseFromLoadThumbnailResult AssetUnmodified = Just $ responseLBS notModified304 [] mempty
responseFromLoadThumbnailResult AssetNotFound   = Nothing
responseFromLoadThumbnailResult (AssetLoaded bytes possibleETag) =
  let headers = getAssetHeaders Nothing possibleETag
  in  Just $ responseLBS ok200 headers bytes

loadProjectThumbnailWithCall :: (MonadIO m, MonadThrow m) => LoadThumbnail -> Text -> Maybe Text -> m (Maybe Application)
loadProjectThumbnailWithCall loadCall projectID possibleETag = do
  possibleThumbnail <- liftIO $ loadCall projectID possibleETag
  let possibleResponse = responseFromLoadThumbnailResult possibleThumbnail
  pure $ fmap (\response -> \_ -> \sendResponse -> sendResponse response) possibleResponse

saveProjectThumbnailWithCall :: (MonadIO m, MonadThrow m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> Text -> BL.ByteString -> (Text -> BL.ByteString -> IO ()) -> m ()
saveProjectThumbnailWithCall metrics pool user projectID thumbnail saveCall = do
  whenProjectOwner metrics pool user projectID $ liftIO $ saveCall projectID thumbnail

closeResources :: Pool SqlBackend -> IO ()
closeResources dbPool = do
  destroyAllResources dbPool

handleRegistryError :: HttpException -> IO (Maybe Value)
handleRegistryError _ = return Nothing

lookupPackageJSON :: Manager -> Text -> IO (Maybe Value)
lookupPackageJSON registryManager urlSuffix = do
  let options = WR.defaults & WR.manager .~ Right registryManager & WR.header "Accept" .~ ["application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*; q=0.7"]
  let registryUrl = "https://registry.npmjs.org/" <> urlSuffix
  resultFromLookup <- (flip catch) handleRegistryError $ do
    responseFromRegistry <- WR.getWith options (toS registryUrl)
    responseAsJSON <- WR.asValue responseFromRegistry
    return (responseAsJSON ^? WR.responseBody)
  return resultFromLookup

emptyAssetsCaches :: [PathAndBuilders] -> IO AssetsCaches
emptyAssetsCaches _assetPathDetails = do
  _hashCache <- newIORef mempty
  _assetResultCache <- newIORef $ AssetResultCache (toJSON $ object []) mempty
  return $ AssetsCaches{..}

getRoundedAccessTime :: String -> IO UTCTime
getRoundedAccessTime filePath = do
  time <- getAccessTime filePath
  let roundedDiffTime = fromInteger $ round $ utctDayTime time
  return $ time { utctDayTime = roundedDiffTime }

type ConduitBytes m = ConduitT () ByteString m ()

cleanupWriteLock :: RWLock -> Bool -> IO ()
cleanupWriteLock lock True = releaseWrite lock
cleanupWriteLock _ False   = pure ()

cachePackagerContent :: (MonadResource m, MonadMask m) => PackageVersionLocksRef -> Text -> ConduitBytes m -> IO (ConduitBytes m, UTCTime)
cachePackagerContent locksRef versionedPackageName fallback = do
  let cacheFileParentPath = ".utopia-cache" </> "packager" </> toS versionedPackageName
  let cacheFilePath = cacheFileParentPath </> "cache.json"
  fileExists <- doesFileExist cacheFilePath
  -- Use the parent path as we can create that and get a last modified date
  -- from it before the file is fully written to disk.
  unless fileExists $ createDirectoryIfMissing True cacheFileParentPath
  lastModified <- getRoundedAccessTime cacheFileParentPath
  let whenFileExists = sourceFile cacheFilePath
  let whenFileDoesNotExist =
            -- Write out the file as well as returning the content.
            let writeToFile = passthroughSink (sinkFileCautious cacheFilePath) (const $ pure ())
            -- Include the fallback.
            in (fallback .| writeToFile)
  let whenFileDoesNotExistSafe = do
            lock <- getPackageVersionLock locksRef versionedPackageName
            pure $ bracketP (tryAcquireWrite lock) (cleanupWriteLock lock) $ \writeAcquired -> do
              case writeAcquired of
                False -> bracketP (acquireRead lock) (const $ releaseRead lock) (const whenFileExists)
                True -> whenFileDoesNotExist

  conduit <- if fileExists then pure whenFileExists else whenFileDoesNotExistSafe
  pure (conduit, lastModified)

filePairsToBytes :: (Monad m) => ConduitT () (FilePath, Value) m () -> ConduitBytes m
filePairsToBytes filePairs =
  let pairToBytes (filePath, pathValue) = (toS $ encode filePath) <> ": " <> (toS $ encode pathValue)
      pairsAsBytes = filePairs .| map pairToBytes
      withCommas = pairsAsBytes .| intersperse ", "
   in sequence_ [yield "{\"contents\": {", withCommas, yield "}}"]

getPackagerContent :: (MonadResource m, MonadMask m) => QSem -> PackageVersionLocksRef -> Text -> IO (ConduitBytes m, UTCTime)
getPackagerContent npmSemaphore packageLocksRef versionedPackageName = do
  cachePackagerContent packageLocksRef versionedPackageName $ do
    withInstalledProject npmSemaphore versionedPackageName (\path -> filePairsToBytes $ getModuleAndDependenciesFiles path)

getUserConfigurationWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> (Maybe DecodedUserConfiguration -> a) -> m a
getUserConfigurationWithPool metrics pool userID action = do
  possibleUserConfiguration <- liftIO $ DB.getUserConfiguration metrics pool userID
  return $ action possibleUserConfiguration

saveUserConfigurationWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> Maybe Value -> m ()
saveUserConfigurationWithPool metrics pool userID possibleShortcutConfig = do
  liftIO $ DB.saveUserConfiguration metrics pool userID possibleShortcutConfig

getProjectDetailsWithPool :: (MonadIO m) => DB.DatabaseMetrics -> Pool SqlBackend -> Text -> m ProjectDetails
getProjectDetailsWithPool metrics pool projectID = do
  projectIDReserved <- liftIO $ DB.checkIfProjectIDReserved metrics pool projectID
  projectMetadata <- liftIO $ DB.getProjectMetadataWithPool metrics pool projectID
  pure $ case (projectIDReserved, projectMetadata) of
            (_, Just metadata) -> ProjectDetailsMetadata metadata
            (True, _)          -> ReservedProjectID projectID
            (False, _)         -> UnknownProject
