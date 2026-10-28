'use client'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The named resolved-values table needs keyboard scrolling. */

import { useState, type CSSProperties, type ReactNode } from 'react'
import { Button, type Theme } from '@cognitap/radiant'
import {
  changeGeometry,
  clearGeometryOverride,
  geometryMetrics,
  geometryPreset,
  geometryPresets,
  geometryValues,
  matchingGeometryPreset,
  type GeometryFields,
  type GeometryRecipe,
  type GeometryScope,
  type GeometrySettings
} from './workshop-geometry'
import {
  borderStyleOptions,
  dials,
  elevationOptions,
  elevationShadows,
  presetVariables,
  scopeOptions
} from './workshop-geometry-view'
import { GeometryDial, OptionCards, type CardOption } from './GeometryControls'
import { Chips } from './TypographyPickers'
import { Changed } from './ControlChange'
import type { Change } from './workshop-history'
import type { Changes } from './workshop-fields'
import type { ControlTarget } from './workshop-inspect'
import './geometry-editor.css'

const presetName = (id: string) => geometryPresets.find(preset => preset.id === id)?.name ?? id
const settingNames: Record<keyof GeometrySettings, string> = {
  ...(Object.fromEntries(dials.map(dial => [dial.key, dial.name])) as Record<
    keyof GeometrySettings,
    string
  >),
  borderStyle: 'Border style',
  elevation: 'Depth'
}
const setting = (key: keyof GeometrySettings) => (value: number | string | undefined) =>
  value === undefined
    ? 'the shared value'
    : key === 'elevation'
      ? elevationOptions[Number(value)]!.name
      : String(value)
const scopes: readonly GeometryScope[] = ['shared', 'light', 'dark']
const targetScope = (target: ControlTarget | undefined) =>
  scopes.find(scope => target?.field.startsWith(`${scope}.`))
const presetCards = geometryPresets.map(preset => ({
  value: preset.id,
  name: preset.name,
  style: presetVariables(preset.values) as CSSProperties,
  sample: (
    <span className="preset-mock">
      <span className="preset-card">
        <span className="preset-button" />
        <span className="preset-input" />
      </span>
    </span>
  )
}))
const depthCards = elevationOptions.map(option => ({
  value: option.value,
  name: option.name,
  style: { ['--p-shadow' as string]: elevationShadows[Number(option.value)] },
  sample: <span className="depth-card" />
}))
const borderCards = borderStyleOptions.map(option => ({
  value: option.value,
  name: option.name,
  style: { ['--p-border-style' as string]: option.value },
  sample: <span className="border-line" />
}))

export function GeometryEditor({
  recipe,
  changes,
  theme,
  disabled,
  target,
  onChange
}: {
  recipe: GeometryRecipe | null
  changes: Changes<GeometryFields> | null
  theme: Theme
  disabled: boolean
  /** The field the shell is jumping to; the editor shows the scope that holds it. */
  target?: ControlTarget
  onChange: (recipe: GeometryRecipe, change: Change) => void
}) {
  const [scope, setScope] = useState<GeometryScope>('shared')
  const [seen, setSeen] = useState(target)
  if (target !== seen) {
    setSeen(target)
    const next = targetScope(target)
    if (next) setScope(next)
  }
  const current = recipe ?? geometryPreset()
  const values = geometryValues(current, scope)
  const overrides = scope === 'shared' ? undefined : current.modes?.[scope]
  const name = (key: keyof GeometrySettings) =>
    scope === 'shared' ? settingNames[key] : `${scope} ${settingNames[key].toLowerCase()}`
  const set = <K extends keyof GeometrySettings>(key: K, value: GeometrySettings[K] | undefined) =>
    value === undefined && scope !== 'shared'
      ? onChange(clearGeometryOverride(current, scope, key), { label: name(key).toLowerCase() })
      : onChange(changeGeometry(current, scope, { [key]: value }), {
          label: name(key).toLowerCase(),
          coalesce: `${scope}.${key}`
        })
  const changed = <K extends keyof GeometrySettings>(
    key: K,
    children: (describedBy: string | undefined) => ReactNode
  ) => (
    <Changed
      changes={changes}
      field={`${scope}.${key}`}
      label={name(key)}
      format={setting(key)}
      set={value => set(key, value as GeometrySettings[K] | undefined)}
    >
      {children}
    </Changed>
  )
  /** In a mode, an overridden value is marked and can go back to the shared one; in shared, a value a mode overrides says so. */
  const note = (key: keyof GeometrySettings) => {
    if (scope !== 'shared')
      return overrides?.[key] === undefined ? null : (
        <span className="geometry-override">
          <span className="geometry-override-dot" />
          {scope} override
          <button
            type="button"
            className="geometry-link"
            onClick={() => set(key, undefined)}
          >
            Use shared
            <span className="workshop-sr-only"> {settingNames[key].toLowerCase()}</span>
          </button>
        </span>
      )
    const modes = (['light', 'dark'] as const).filter(
      mode => current.modes?.[mode]?.[key] !== undefined
    )
    return modes.length ? (
      <span className="geometry-differs">differs in {modes.join(' and ')}</span>
    ) : null
  }
  const choice = (
    key: 'borderStyle' | 'elevation',
    label: string,
    options: readonly CardOption[],
    parse: (value: string) => GeometrySettings[typeof key]
  ) => (
    <div
      className="geometry-choice"
      data-overridden={overrides?.[key] !== undefined || undefined}
    >
      <h4>{label}</h4>
      {changed(key, describedBy => (
        <OptionCards
          label={label}
          options={options}
          value={String(values[key])}
          describedBy={describedBy}
          onChange={value => set(key, parse(value))}
        />
      ))}
      {note(key)}
    </div>
  )
  return (
    <div className="geometry-editor">
      {!recipe && (
        <>
          <p className="geometry-lead">
            These spacing and surface values are set by hand and kept exactly. Start from a preset
            to edit them.
          </p>
          <Button
            variant="soft"
            disabled={disabled}
            onClick={() => onChange(geometryPreset(), { label: 'starting preset' })}
          >
            Start from Balanced
          </Button>
        </>
      )}
      <fieldset
        hidden={!recipe}
        disabled={disabled}
        className="geometry-settings"
      >
        <legend className="workshop-sr-only">Spacing and surface decisions</legend>
        <section className="geometry-section">
          <h4>Starting preset</h4>
          <Changed
            changes={changes}
            field="preset"
            label="Starting preset"
            format={presetName}
            set={id => onChange(geometryPreset(id), { label: 'starting preset' })}
          >
            {describedBy => (
              <OptionCards
                label="Starting preset"
                options={presetCards}
                value={matchingGeometryPreset(current)}
                describedBy={describedBy}
                onChange={id => onChange(geometryPreset(id), { label: 'starting preset' })}
              />
            )}
          </Changed>
        </section>
        <section className="geometry-section">
          <div className="geometry-head">
            <h4>Editing</h4>
            {scope !== 'shared' && (
              <button
                type="button"
                className="geometry-link"
                disabled={!overrides}
                onClick={() =>
                  onChange(clearGeometryOverride(current, scope), { label: `${scope} overrides` })
                }
              >
                Clear all {scope} overrides
              </button>
            )}
          </div>
          <Chips
            label="Editing"
            options={scopeOptions}
            value={scope}
            onChange={value => setScope(value as GeometryScope)}
          />
          <div className="geometry-dials">
            {dials.map(dial => (
              <div
                className="geometry-setting"
                key={`${scope}:${dial.key}`}
                data-overridden={overrides?.[dial.key] !== undefined || undefined}
              >
                {changed(dial.key, describedBy => (
                  <GeometryDial
                    dial={dial}
                    value={values[dial.key]}
                    describedBy={describedBy}
                    note={note(dial.key)}
                    onChange={value => set(dial.key, value)}
                  />
                ))}
              </div>
            ))}
          </div>
          {choice('borderStyle', 'Border style', borderCards, value =>
            value === 'dashed' || value === 'dotted' ? value : 'solid'
          )}
          {choice('elevation', 'Depth', depthCards, value => {
            const level = Number(value)
            return level === 1 || level === 2 || level === 3 ? level : 0
          })}
        </section>
      </fieldset>
      <details className="geometry-resolved">
        <summary>Resolved spacing and surface values</summary>
        <section
          className="geometry-table-scroll"
          aria-label="Resolved geometry values"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Light</th>
                <th scope="col">Dark</th>
              </tr>
            </thead>
            <tbody>
              {geometryMetrics.map(([label, variable]) => (
                <tr key={variable}>
                  <th scope="row">{label}</th>
                  <td>
                    <code>{theme.modes.light[variable]}</code>
                  </td>
                  <td>
                    <code>{theme.modes.dark[variable]}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </details>
    </div>
  )
}
