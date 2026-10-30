'use client'

/** Native selects keep the docs controls independent of unreleased components. */
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
    <label>
      {label}
      <select
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
      </select>
    </label>
  )
}
