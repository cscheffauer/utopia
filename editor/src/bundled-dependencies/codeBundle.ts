import { ExportsInfo } from '../core/workers/ts/ts-worker'

// If you wish to update this auto-generated file, go to codeBundle.spec.ts and find the test called
// 'Update Saved Bundle' and change the test function from xit(... to it(... to enable it

export const SampleFileBuildResult = JSON.parse(`{
  "/src/app.js": {
    "errors": [],
    "transpiledCode": "\\"use strict\\";\\n\\nvar __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {\\n  if (k2 === undefined) k2 = k;\\n  Object.defineProperty(o, k2, {\\n    enumerable: true,\\n    get: function get() {\\n      return m[k];\\n    }\\n  });\\n} : function (o, m, k, k2) {\\n  if (k2 === undefined) k2 = k;\\n  o[k2] = m[k];\\n});\\n\\nvar __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {\\n  Object.defineProperty(o, \\"default\\", {\\n    enumerable: true,\\n    value: v\\n  });\\n} : function (o, v) {\\n  o[\\"default\\"] = v;\\n});\\n\\nvar __importStar = this && this.__importStar || function (mod) {\\n  if (mod && mod.__esModule) return mod;\\n  var result = {};\\n  if (mod != null) for (var k in mod) {\\n    if (k !== \\"default\\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\\n  }\\n\\n  __setModuleDefault(result, mod);\\n\\n  return result;\\n};\\n\\nObject.defineProperty(exports, \\"__esModule\\", {\\n  value: true\\n});\\nexports.App = void 0;\\n\\nvar React = __importStar(require(\\"react\\"));\\n\\nexports.App = function (props) {\\n  return React.createElement(\\"div\\", {\\n    style: {\\n      width: '100%',\\n      height: '100%',\\n      backgroundColor: '#FFFFFF',\\n      position: 'relative'\\n    }\\n  });\\n}; //# sourceMappingURL=app.js.map",
    "sourceMap": {
      "version": 3,
      "sources": [
        "../../src/app.js"
      ],
      "names": [],
      "mappings": ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AACA,IAAA,KAAA,GAAA,YAAA,CAAA,OAAA,CAAA,OAAA,CAAA,CAAA;;AACW,OAAA,CAAA,GAAA,GAAM,UAAC,KAAD,EAAU;AACzB,SACE,KAAA,CAAA,aAAA,CAAA,KAAA,EAAA;AACE,IAAA,KAAK,EAAE;AAAE,MAAA,KAAK,EAAE,MAAT;AAAiB,MAAA,MAAM,EAAE,MAAzB;AAAiC,MAAA,eAAe,EAAE,SAAlD;AAA6D,MAAA,QAAQ,EAAE;AAAvE;AADT,GAAA,CADF;AAKD,CANU,C",
      "sourcesContent": [
        "\\nimport * as React from 'react'\\nexport var App = (props) => {\\n  return (\\n    <div\\n      style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', position: 'relative' }}\\n    />\\n  )\\n}"
      ],
      "sourceRoot": "",
      "file": "app.js"
    }
  },
  "/src/index.js": {
    "errors": [],
    "transpiledCode": "\\"use strict\\";\\n\\nvar __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {\\n  if (k2 === undefined) k2 = k;\\n  Object.defineProperty(o, k2, {\\n    enumerable: true,\\n    get: function get() {\\n      return m[k];\\n    }\\n  });\\n} : function (o, m, k, k2) {\\n  if (k2 === undefined) k2 = k;\\n  o[k2] = m[k];\\n});\\n\\nvar __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {\\n  Object.defineProperty(o, \\"default\\", {\\n    enumerable: true,\\n    value: v\\n  });\\n} : function (o, v) {\\n  o[\\"default\\"] = v;\\n});\\n\\nvar __importStar = this && this.__importStar || function (mod) {\\n  if (mod && mod.__esModule) return mod;\\n  var result = {};\\n  if (mod != null) for (var k in mod) {\\n    if (k !== \\"default\\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\\n  }\\n\\n  __setModuleDefault(result, mod);\\n\\n  return result;\\n};\\n\\nObject.defineProperty(exports, \\"__esModule\\", {\\n  value: true\\n});\\n\\nvar React = __importStar(require(\\"react\\"));\\n\\nvar ReactDOM = __importStar(require(\\"react-dom\\"));\\n\\nvar app_1 = require(\\"../src/app\\");\\n\\nvar root = document.getElementById(\\"root\\");\\n\\nif (root != null) {\\n  ReactDOM.render(React.createElement(app_1.App, null), root);\\n} //# sourceMappingURL=index.js.map",
    "sourceMap": {
      "version": 3,
      "sources": [
        "../../src/index.js"
      ],
      "names": [],
      "mappings": ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AAAA,IAAA,KAAA,GAAA,YAAA,CAAA,OAAA,CAAA,OAAA,CAAA,CAAA;;AACA,IAAA,QAAA,GAAA,YAAA,CAAA,OAAA,CAAA,WAAA,CAAA,CAAA;;AACA,IAAA,KAAA,GAAA,OAAA,CAAA,YAAA,CAAA;;AAEA,IAAM,IAAI,GAAG,QAAQ,CAAC,cAAT,CAAwB,MAAxB,CAAb;;AACA,IAAI,IAAI,IAAI,IAAZ,EAAkB;AAChB,EAAA,QAAQ,CAAC,MAAT,CAAgB,KAAA,CAAA,aAAA,CAAC,KAAA,CAAA,GAAD,EAAI,IAAJ,CAAhB,EAAyB,IAAzB;AACD,C",
      "sourcesContent": [
        "import * as React from \\"react\\";\\nimport * as ReactDOM from \\"react-dom\\";\\nimport { App } from \\"../src/app\\";\\n\\nconst root = document.getElementById(\\"root\\");\\nif (root != null) {\\n  ReactDOM.render(<App />, root);\\n}"
      ],
      "sourceRoot": "",
      "file": "index.js"
    }
  },
  "/utopia/storyboard.js": {
    "errors": [],
    "transpiledCode": "\\"use strict\\";\\n\\nvar __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {\\n  if (k2 === undefined) k2 = k;\\n  Object.defineProperty(o, k2, {\\n    enumerable: true,\\n    get: function get() {\\n      return m[k];\\n    }\\n  });\\n} : function (o, m, k, k2) {\\n  if (k2 === undefined) k2 = k;\\n  o[k2] = m[k];\\n});\\n\\nvar __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {\\n  Object.defineProperty(o, \\"default\\", {\\n    enumerable: true,\\n    value: v\\n  });\\n} : function (o, v) {\\n  o[\\"default\\"] = v;\\n});\\n\\nvar __importStar = this && this.__importStar || function (mod) {\\n  if (mod && mod.__esModule) return mod;\\n  var result = {};\\n  if (mod != null) for (var k in mod) {\\n    if (k !== \\"default\\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\\n  }\\n\\n  __setModuleDefault(result, mod);\\n\\n  return result;\\n};\\n\\nObject.defineProperty(exports, \\"__esModule\\", {\\n  value: true\\n});\\nexports.storyboard = void 0;\\n\\nvar React = __importStar(require(\\"react\\"));\\n\\nvar utopia_api_1 = require(\\"utopia-api\\");\\n\\nvar app_js_1 = require(\\"/src/app.js\\");\\n\\nexports.storyboard = React.createElement(utopia_api_1.Storyboard, null, React.createElement(utopia_api_1.Scene, {\\n  style: {\\n    position: 'absolute',\\n    left: 0,\\n    top: 0,\\n    width: 375,\\n    height: 812\\n  }\\n}, React.createElement(app_js_1.App, null))); //# sourceMappingURL=storyboard.js.map",
    "sourceMap": {
      "version": 3,
      "sources": [
        "../../utopia/storyboard.js"
      ],
      "names": [],
      "mappings": ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AACA,IAAA,KAAA,GAAA,YAAA,CAAA,OAAA,CAAA,OAAA,CAAA,CAAA;;AACA,IAAA,YAAA,GAAA,OAAA,CAAA,YAAA,CAAA;;AACA,IAAA,QAAA,GAAA,OAAA,CAAA,aAAA,CAAA;;AACW,OAAA,CAAA,UAAA,GACT,KAAA,CAAA,aAAA,CAAC,YAAA,CAAA,UAAD,EAAW,IAAX,EACE,KAAA,CAAA,aAAA,CAAC,YAAA,CAAA,KAAD,EAAM;AACJ,EAAA,KAAK,EAAE;AAAE,IAAA,QAAQ,EAAE,UAAZ;AAAwB,IAAA,IAAI,EAAE,CAA9B;AAAiC,IAAA,GAAG,EAAE,CAAtC;AAAyC,IAAA,KAAK,EAAE,GAAhD;AAAqD,IAAA,MAAM,EAAE;AAA7D;AADH,CAAN,EAGE,KAAA,CAAA,aAAA,CAAC,QAAA,CAAA,GAAD,EAAI,IAAJ,CAHF,CADF,CADS,C",
      "sourcesContent": [
        "\\nimport * as React from 'react'\\nimport { Scene, Storyboard } from 'utopia-api'\\nimport { App } from '/src/app.js'\\nexport var storyboard = (\\n  <Storyboard>\\n    <Scene\\n      style={{ position: 'absolute', left: 0, top: 0, width: 375, height: 812 }}\\n    >\\n      <App />\\n    </Scene>\\n  </Storyboard>\\n)\\n\\n"
      ],
      "sourceRoot": "",
      "file": "storyboard.js"
    }
  }
}`)

export const SampleFileBundledExportsInfo: Array<ExportsInfo> = JSON.parse(`[
  {
    "filename": "/src/app.js",
    "code": "\\nimport * as React from 'react'\\nexport var App = (props) => {\\n  return (\\n    <div\\n      style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', position: 'relative' }}\\n    />\\n  )\\n}",
    "exportTypes": {
      "App": {
        "type": "(props: any) => Element",
        "functionInfo": [
          {
            "name": "props",
            "memberInfo": {
              "type": "any",
              "members": {}
            }
          }
        ],
        "reactClassInfo": null
      }
    }
  },
  {
    "filename": "/src/index.js",
    "code": "import * as React from \\"react\\";\\nimport * as ReactDOM from \\"react-dom\\";\\nimport { App } from \\"../src/app\\";\\n\\nconst root = document.getElementById(\\"root\\");\\nif (root != null) {\\n  ReactDOM.render(<App />, root);\\n}",
    "exportTypes": {}
  },
  {
    "filename": "/utopia/storyboard.js",
    "code": "\\nimport * as React from 'react'\\nimport { Scene, Storyboard } from 'utopia-api'\\nimport { App } from '/src/app.js'\\nexport var storyboard = (\\n  <Storyboard>\\n    <Scene\\n      style={{ position: 'absolute', left: 0, top: 0, width: 375, height: 812 }}\\n    >\\n      <App />\\n    </Scene>\\n  </Storyboard>\\n)\\n\\n",
    "exportTypes": {
      "storyboard": {
        "type": "Element",
        "functionInfo": null,
        "reactClassInfo": null
      }
    }
  }
]`)
