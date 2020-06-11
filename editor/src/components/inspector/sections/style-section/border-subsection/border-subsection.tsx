import * as React from 'react'
import {
  CheckboxInput,
  FlexRow,
  Icn,
  InspectorSubsectionHeader,
  NumberInput,
  SquareButton,
} from 'uuiui'
import { betterReactMemo } from 'uuiui-deps'
import { isRight } from '../../../../../core/shared/either'
import utils from '../../../../../utils/utils'
import { InspectorContextMenuWrapper } from '../../../../context-menu-wrapper'
import { addOnUnsetValues } from '../../../common/context-menu-items'
import {
  CSSBorder,
  CSSColor,
  cssLineStyle,
  cssLineWidth,
  CSSNumber,
  defaultBorderWidth,
  defaultCSSBorder,
  EmptyInputValue,
  isCSSKeyword,
  isCSSNumber,
  isCSSUnknownFunctionParameters,
  isEmptyInputValue,
  parseCSSColor,
  cssKeyword,
} from '../../../common/css-utils'
import { useGetSubsectionHeaderStyle } from '../../../common/inspector-utils'
import { useInspectorStyleInfo, useIsSubSectionVisible } from '../../../common/property-path-hooks'
import { ColorControl, StringColorControl } from '../../../controls/color-control'
import { FakeUnknownArrayItem } from '../../../controls/unknown-array-item'
import { GridRow } from '../../../widgets/grid-row'

export function updateBorderEnabled(_: null, oldValue: CSSBorder): CSSBorder {
  return {
    ...oldValue,
    style: cssLineStyle(cssKeyword(oldValue.style?.style ?? 'none' === 'none' ? 'solid' : 'none')),
  }
}

export function updateBorderWidth(
  newWidth: CSSNumber | EmptyInputValue,
  oldValue: CSSBorder,
): CSSBorder {
  if (isEmptyInputValue(newWidth)) {
    let newValue = {
      ...oldValue,
    }
    delete newValue.width
    return newValue
  } else {
    return {
      ...oldValue,
      style:
        (oldValue.style?.style ?? 'none') === 'none'
          ? cssLineStyle(cssKeyword('solid'))
          : oldValue.style,
      width: cssLineWidth(newWidth),
    }
  }
}

export function updateBorderColor(newColor: CSSColor, oldValue: CSSBorder): CSSBorder {
  return {
    ...oldValue,
    style:
      (oldValue.style?.style ?? 'none') === 'none'
        ? cssLineStyle(cssKeyword('solid'))
        : oldValue.style,
    color: newColor,
  }
}

export function updateBorderColorString(newValue: string, oldValue: CSSBorder): CSSBorder {
  const parsed = parseCSSColor(newValue)
  if (isRight(parsed)) {
    return updateBorderColor(parsed.value, oldValue)
  } else {
    return oldValue
  }
}

function insertBorder(_: null, oldValue: CSSBorder): CSSBorder {
  return { ...defaultCSSBorder }
}

export const BorderSubsection: React.FunctionComponent = betterReactMemo('BorderSubsection', () => {
  const isVisible = useIsSubSectionVisible('border')

  const {
    value,
    controlStatus,
    controlStyles,
    propertyStatus,
    onUnsetValues,
    useSubmitValueFactory,
  } = useInspectorStyleInfo('border')

  const headerStyle = useGetSubsectionHeaderStyle(controlStatus)

  const borderEnabled = (value.style?.style ?? 'none') !== 'none'
  const borderColor: CSSColor = value.color ?? defaultCSSBorder.color
  const borderWidth: CSSNumber = (() => {
    if (value.width == null) {
      return { ...defaultBorderWidth }
    } else if (isCSSNumber(value.width.width)) {
      return value.width.width
    } else {
      // TODO: CSSKeyword support in number controls
      return { ...defaultBorderWidth }
    }
  })()

  const [borderEnabledSubmitValue] = useSubmitValueFactory(updateBorderEnabled)
  const onCheckboxChange = React.useCallback(() => {
    borderEnabledSubmitValue(null)
  }, [borderEnabledSubmitValue])

  const [onInsertBorderSubmitValue] = useSubmitValueFactory(insertBorder)
  const onInsertMouseDown = React.useCallback(() => {
    onInsertBorderSubmitValue(null)
  }, [onInsertBorderSubmitValue])

  const [borderColorSubmitValue, borderColorTransientSubmitValue] = useSubmitValueFactory(
    updateBorderColor,
  )
  const [borderColorStringSubmitValue] = useSubmitValueFactory(updateBorderColorString)
  const [borderWidthSubmitValue, borderWidthTransientSubmitValue] = useSubmitValueFactory(
    updateBorderWidth,
  )

  const allOrSplitControls = (
    <GridRow tall alignItems='start' padded={false} type='<-------1fr------>|----80px----|'>
      <StringColorControl
        id='border-color'
        key='border-color'
        value={borderColor}
        onSubmitValue={borderColorSubmitValue}
        onTransientSubmitValue={borderColorTransientSubmitValue}
        onSubmitSolidStringValue={borderColorStringSubmitValue}
        pickerOffset={{ x: -45, y: 0 }}
        controlStatus={controlStatus}
        controlStyles={controlStyles}
      />
      <NumberInput
        id='border-width'
        value={borderWidth}
        labelBelow='width'
        minimum={0}
        onSubmitValue={borderWidthSubmitValue}
        onTransientSubmitValue={borderWidthTransientSubmitValue}
        controlStatus={controlStatus}
        numberType='Length'
      />
    </GridRow>
  )

  const showBorder: boolean = value.width != null || value.color != null || value.style != null

  const contextMenuItems = utils.stripNulls([
    'border' in value ? addOnUnsetValues(['border parameters'], onUnsetValues) : null,
  ])

  if (!isVisible) {
    return null
  }
  return (
    <InspectorContextMenuWrapper
      id='border-subsection-context-menu'
      items={contextMenuItems}
      data={null}
    >
      <InspectorSubsectionHeader style={headerStyle}>
        <FlexRow
          style={{
            flexGrow: 1,
          }}
        >
          Border
        </FlexRow>
        {propertyStatus.overwritable ? (
          <SquareButton
            highlight
            onMouseDown={onInsertMouseDown}
            disabled={value.color != null || value.width != null || value.style != null}
          >
            <Icn
              style={{ paddingTop: 1 }}
              category='semantic'
              type='plus'
              color={propertyStatus.controlled ? 'blue' : 'darkgray'}
              width={16}
              height={16}
            />
          </SquareButton>
        ) : null}
      </InspectorSubsectionHeader>

      {showBorder ? (
        isCSSUnknownFunctionParameters(value) ? (
          <FakeUnknownArrayItem controlStatus={controlStatus} />
        ) : (
          <GridRow tall alignItems='start' padded={true} type='<---1fr--->|------172px-------|'>
            <GridRow tall alignItems='start' padded={false} type='<-auto-><----------1fr--------->'>
              <CheckboxInput
                id={`shadow-enable-disable`}
                key={`shadow-enable-disable`}
                checked={borderEnabled}
                onChange={onCheckboxChange}
                controlStatus={controlStatus}
              />
              <ColorControl
                id='border-color'
                key='border-color'
                value={borderColor}
                onSubmitValue={borderColorSubmitValue}
                onTransientSubmitValue={borderColorTransientSubmitValue}
                onSubmitSolidStringValue={borderColorStringSubmitValue}
                pickerOffset={{ x: -45, y: 0 }}
                controlStatus={controlStatus}
                controlStyles={controlStyles}
              />
            </GridRow>
            {allOrSplitControls}
          </GridRow>
        )
      ) : null}
    </InspectorContextMenuWrapper>
  )
})
BorderSubsection.displayName = 'BorderSubsection'
