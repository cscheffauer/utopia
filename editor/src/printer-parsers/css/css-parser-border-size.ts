import {
  CSSKeyword,
  CSSLineWidth,
  cssLineWidth,
  CSSLineWidthKeywordValue,
  cssLineWidthKeywordValues,
  CSSNumber,
} from '../../components/inspector/common/css-utils'
import { Either, isRight, left, mapEither } from '../../core/shared/either'
import { descriptionParseError, parseAlternative, Parser } from '../../utils/value-parser-utils'
import {
  isLexerMatch,
  isNamedSyntaxType,
  parseCSSValidKeyword,
  parseLength,
} from './css-parser-utils'

export const parseLineWidth: Parser<CSSLineWidth> = (value: unknown) => {
  if (isLexerMatch(value) && isNamedSyntaxType(value.syntax, ['line-width'])) {
    const parsed = parseAlternative<CSSNumber | CSSKeyword<CSSLineWidthKeywordValue>>(
      [parseLength, parseCSSValidKeyword(cssLineWidthKeywordValues)],
      `Value ${JSON.stringify(value)} is not valid bg-size`,
    )(value.match[0])
    return mapEither(cssLineWidth, parsed)
  } else {
    return left(descriptionParseError('Value is not a <line-width>'))
  }
}

export function parseBorderSize(value: unknown): Either<string, CSSLineWidth> {
  const parsed = parseLineWidth(value)
  if (isRight(parsed)) {
    return parsed
  } else {
    return left(parsed.value.type)
  }
}
