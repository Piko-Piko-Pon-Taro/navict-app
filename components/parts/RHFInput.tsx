// Component for React-Hook-Form Input
import React from 'react'
import { FieldValues, UseFormRegister, ValidationRule } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  name: string
  defaultValue?: string
  placeholder?: string
  required?: string | ValidationRule<boolean>
  className?: string
}

const RHFInput = ({
  register,
  name,
  defaultValue,
  placeholder,
  required,
  className
}: Props) => {
  return (
    <input
      className={`placeholder-$primary2 text-$primary ${className}`}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...register(name, { required })}
    />
  )
}

export default RHFInput
