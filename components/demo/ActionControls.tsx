'use client'

import { type Theme, type ThemeMode } from '@cognitap/radiant'
import { themes } from '@cognitap/radiant/examples'

/** Native selects keep the docs controls independent of unreleased components. */
export function SelectControl<Value extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: Value
  options: readonly Value[]
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
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export function PreviewThemeControls({
  theme,
  mode,
  onThemeChange,
  onModeChange
}: {
  theme: Theme
  mode: ThemeMode
  onThemeChange: (theme: Theme) => void
  onModeChange: (mode: ThemeMode) => void
}) {
  return (
    <>
      <label>
        Theme
        <select
          value={theme.id}
          onChange={event => {
            const selected = themes.find(preset => preset.id === event.target.value)
            if (selected) onThemeChange(selected)
          }}
        >
          {themes.map(preset => (
            <option
              key={preset.id}
              value={preset.id}
            >
              {preset.name}
            </option>
          ))}
        </select>
      </label>
      <SelectControl
        label="Mode"
        value={mode}
        options={['light', 'dark', 'system']}
        onChange={onModeChange}
      />
    </>
  )
}
