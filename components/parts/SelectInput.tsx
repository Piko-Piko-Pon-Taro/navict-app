import React from 'react'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { ActionMeta, GroupTypeBase, OptionTypeBase, Styles } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { systemColorToColorCode } from 'utils/utility'
export type SelectOption = {
  index?: number
  value: string
  label: string
}
type Props = {
  options: SelectOption[]
  placeholder: string
  multiple: boolean
  onSelectOption?: (value: SelectOption | SelectOption[]) => void
  onCreateOption?: (value: SelectOption | SelectOption[]) => void
  onInputChange?: (keyword: string) => void
  field: ControllerRenderProps<FieldValues, string>
}

const SelectInput = ({
  options,
  placeholder = 'select',
  multiple,
  onSelectOption,
  onCreateOption,
  onInputChange,
  field
}: Props) => {
  const colourStyles: Partial<
    Styles<OptionTypeBase, true, GroupTypeBase<OptionTypeBase>>
  > = {
    control: (styles) => ({
      ...styles,
      display: 'flex',
      backgroundColor: 'white',
      color: systemColorToColorCode('$shade1'),
      borderColor: systemColorToColorCode('$shade2'),
      borderWidth: '4px',
      borderRadius: '10px',
      height: '3.875em',
      padding: '0.2em',
      cursor: 'text'
    }),
    placeholder: (styles) => ({
      ...styles,
      color: systemColorToColorCode('$shade1')
    }),
    menu: (styles) => ({
      ...styles,
      padding: '0.8em 2em'
    }),
    indicatorSeparator: () => {
      return {
        display: 'none'
      }
    },
    dropdownIndicator: () => {
      return {
        display: 'none'
      }
    },
    option: (styles, { isFocused }) => {
      return {
        ...styles,
        color: systemColorToColorCode('$primary'),
        padding: '0.5em 1em',
        borderRadius: '0.625rem',
        backgroundColor: isFocused ? 'rgba(92, 196, 222, 0.1)' : 'initial',
        width: 'inherit'
      }
    },
    multiValue: (styles) => {
      return {
        ...styles,
        backgroundColor: 'rgba(118,195,219,0.2)',
        padding: '0.5em',
        borderRadius: '2em'
      }
    },
    multiValueLabel: (styles) => ({
      ...styles,
      color: systemColorToColorCode('$indigo')
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      color: systemColorToColorCode('$primary2'),
      ':hover': {
        color: 'red'
      }
    })
  }

  const handleChange = (
    value: SelectOption | SelectOption[],
    action: ActionMeta<any> // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    field.onChange(value)
    if (action.action == 'select-option') {
      if (onSelectOption) onSelectOption(value)
    } else if (action.action == 'create-option') {
      if (onCreateOption) onCreateOption(value)
    }
  }

  return (
    <div className="w-full">
      <CreatableSelect
        {...field}
        isMulti={multiple}
        onChange={handleChange}
        onInputChange={onInputChange}
        options={options}
        styles={colourStyles}
        placeholder={placeholder}
      />
    </div>
  )
}

export default SelectInput
