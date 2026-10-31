'use client'

import { Field, NativeSelect } from '@cognitap/radiant'

export function SelectControl<Value extends string>({
  label,
  value,
  options,
  optionLabels,
  onChange
}: {
  label: string
  value: Value
  options: readonly Value[]
  optionLabels?: Partial<Record<Value, string>>
  onChange: (value: Value) => void
}) {
  return (
    <Field
      label={label}
      className="demo-control"
    >
      <NativeSelect
        controlSize="small"
        value={value}
        onChange={event => {
          const selected = options.find(option => option === event.target.value)
          if (selected !== undefined) onChange(selected)
        }}
      >
        {options.map(option => (
          <option
            key={option}
            value={option}
          >
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </NativeSelect>
    </Field>
  )
}
