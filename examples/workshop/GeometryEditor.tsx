'use client'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The named resolved-values table needs keyboard scrolling. */

import { useId, useState, type ReactNode } from 'react'
import { Button, Field, Input, type Theme } from '@cognitap/radiant'
import {
  changeGeometry,
  clearGeometryOverride,
  geometryDials,
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
import { Changed } from './ControlChange'
import type { Change } from './workshop-history'
import type { Changes } from './workshop-fields'
import type { ControlTarget } from './workshop-inspect'
import './geometry-editor.css'

type Dial = (typeof geometryDials)[number]
const presetName = (id: string) => geometryPresets.find(preset => preset.id === id)?.name ?? id
const elevationNames = ['Flat', 'Baseline shadows', 'Raised', 'Floating']
const setting = (key: keyof GeometrySettings) => (value: number | string | undefined) =>
  value === undefined
    ? 'the shared value'
    : key === 'elevation'
      ? elevationNames[Number(value)]
      : String(value)
function NumberControl({
  dial,
  value,
  describedBy,
  onValid
}: {
  dial: Dial
  value: number
  describedBy?: string
  onValid: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  const [previous, setPrevious] = useState(value)
  if (previous !== value) {
    setPrevious(value)
    setDraft(String(value))
  }
  const number = Number(draft)
  const valid =
    draft.trim() !== '' && Number.isFinite(number) && number >= dial.min && number <= dial.max
  const id = useId()
  return (
    <div className="geometry-number">
      <Field
        label={`${dial.label}${dial.unit ? ` (${dial.unit})` : ''}`}
        description={`${dial.help} Range ${dial.min}–${dial.max}.`}
        error={
          valid
            ? undefined
            : `Enter a number from ${dial.min} to ${dial.max}. The last valid theme is still shown.`
        }
      >
        <Input
          type="number"
          min={dial.min}
          max={dial.max}
          step="any"
          aria-describedby={describedBy}
          value={draft}
          onChange={event => {
            const text = event.target.value
            setDraft(text)
            const next = Number(text)
            if (text.trim() && Number.isFinite(next) && next >= dial.min && next <= dial.max)
              onValid(next)
          }}
        />
      </Field>
      <label
        className="geometry-range"
        htmlFor={id}
      >
        {dial.label} slider
        <input
          id={id}
          type="range"
          value={value}
          min={dial.min}
          max={dial.max}
          step={dial.step}
          aria-describedby={describedBy}
          onChange={event => {
            setDraft(event.target.value)
            onValid(Number(event.target.value))
          }}
        />
      </label>
    </div>
  )
}

const scopes: readonly GeometryScope[] = ['shared', 'light', 'dark']
const targetScope = (target: ControlTarget | undefined) =>
  scopes.find(scope => target?.field.startsWith(`${scope}.`))
const settingNames: Record<keyof GeometrySettings, string> = {
  ...Object.fromEntries(geometryDials.map(dial => [dial.key, dial.label])),
  borderStyle: 'Border style',
  elevation: 'Surface elevation'
} as Record<keyof GeometrySettings, string>
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
  const values = geometryValues(recipe ?? geometryPreset(), scope)
  const overrides = scope === 'shared' ? undefined : recipe?.modes?.[scope]
  const name = (key: keyof GeometrySettings) =>
    scope === 'shared' ? settingNames[key] : `${scope} ${settingNames[key].toLowerCase()}`
  const update = (patch: Partial<GeometrySettings>, change: Change) =>
    onChange(changeGeometry(recipe ?? geometryPreset(), scope, patch), change)
  const set = <K extends keyof GeometrySettings>(key: K, value: GeometrySettings[K] | undefined) =>
    value === undefined && scope !== 'shared'
      ? onChange(clearGeometryOverride(recipe ?? geometryPreset(), scope, key), {
          label: name(key).toLowerCase()
        })
      : update({ [key]: value }, { label: name(key).toLowerCase(), coalesce: `${scope}.${key}` })
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
  const overrideControl = (key: keyof GeometrySettings) =>
    scope !== 'shared' && (
      <div className="geometry-override">
        <span>{overrides?.[key] === undefined ? 'Using shared value' : `${scope} override`}</span>
        <Button
          variant="outline"
          disabled={overrides?.[key] === undefined}
          onClick={() => set(key, undefined)}
        >
          Use shared{' '}
          {key === 'borderStyle'
            ? 'border style'
            : key === 'elevation'
              ? 'elevation'
              : geometryDials.find(dial => dial.key === key)!.label.toLowerCase()}
        </Button>
      </div>
    )
  return (
    <div className="geometry-editor">
      {!recipe && (
        <p>
          Imported spacing and surface values are preserved exactly. This document has no matching
          geometry recipe. Use Reset spacing &amp; surfaces to start Balanced settings while
          retaining other sections.
        </p>
      )}
      <fieldset
        hidden={!recipe}
        disabled={disabled}
        className="geometry-settings"
      >
        <legend>Spacing and surface decisions</legend>
        <div className="geometry-toolbar">
          <Changed
            changes={changes}
            field="preset"
            label="Starting preset"
            format={presetName}
            set={id => onChange(geometryPreset(id), { label: 'starting preset' })}
          >
            {describedBy => (
              <label>
                Starting preset
                <select
                  value={matchingGeometryPreset(recipe ?? geometryPreset())}
                  aria-describedby={describedBy}
                  onChange={event =>
                    onChange(geometryPreset(event.target.value), { label: 'starting preset' })
                  }
                >
                  <option
                    value="custom"
                    disabled
                  >
                    Custom settings
                  </option>
                  {geometryPresets.map(preset => (
                    <option
                      key={preset.id}
                      value={preset.id}
                    >
                      {preset.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </Changed>
          <label>
            Geometry scope
            <select
              value={scope}
              onChange={event => {
                if (
                  event.target.value === 'shared' ||
                  event.target.value === 'light' ||
                  event.target.value === 'dark'
                )
                  setScope(event.target.value)
              }}
            >
              <option value="shared">Shared defaults</option>
              <option value="light">Light overrides</option>
              <option value="dark">Dark overrides</option>
            </select>
          </label>
        </div>
        <p>
          Presets replace this editor’s decisions in both modes. Shared defaults apply unless a mode
          overrides a value. Balanced starts with a 45% light backdrop and a 65% dark override.
          Selecting a preset or resetting clears previous mode overrides.
        </p>
        {scope !== 'shared' && (
          <Button
            variant="outline"
            disabled={!overrides}
            onClick={() =>
              onChange(clearGeometryOverride(recipe ?? geometryPreset(), scope), {
                label: `${scope} overrides`
              })
            }
          >
            Clear all {scope} overrides
          </Button>
        )}
        <div className="geometry-grid">
          {geometryDials.map(dial => (
            <div
              className="geometry-setting"
              key={`${scope}:${dial.key}`}
            >
              {changed(dial.key, describedBy => (
                <NumberControl
                  dial={dial}
                  value={values[dial.key]}
                  describedBy={describedBy}
                  onValid={value => set(dial.key, value)}
                />
              ))}
              {overrideControl(dial.key)}
            </div>
          ))}
          <div className="geometry-setting">
            {changed('borderStyle', describedBy => (
              <label>
                Border style
                <select
                  value={values.borderStyle}
                  aria-describedby={describedBy}
                  onChange={event => {
                    const value = event.target.value
                    if (value === 'solid' || value === 'dashed' || value === 'dotted')
                      set('borderStyle', value)
                  }}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </label>
            ))}
            <p>Applies to both control and surface borders.</p>
            {overrideControl('borderStyle')}
          </div>
          <div className="geometry-setting">
            {changed('elevation', describedBy => (
              <label>
                Surface elevation
                <select
                  value={values.elevation}
                  aria-describedby={describedBy}
                  onChange={event => {
                    const value = Number(event.target.value)
                    if (value === 0 || value === 1 || value === 2 || value === 3)
                      set('elevation', value)
                  }}
                >
                  <option value={0}>Flat · no shadows</option>
                  <option value={1}>Baseline shadows</option>
                  <option value={2}>Raised</option>
                  <option value={3}>Floating</option>
                </select>
              </label>
            ))}
            <p>
              Panel and overlay shadows use mode-specific opacity. Action shadows and dialog panel
              filters remain component exceptions.
            </p>
            {overrideControl('elevation')}
          </div>
        </div>
      </fieldset>
      <p className="geometry-guidance">
        Spacing and density scale from Radiant’s neutral baseline, so repeated edits never compound.
        Density preserves fonts. Component exceptions can override shared values. Use the Components
        specimen to inspect all three sizes, keyboard focus, invalid/disabled states and the real
        modal backdrop. Check boundaries and hit targets when reducing density or removing borders.
      </p>
      <details className="geometry-resolved">
        <summary>Resolved spacing and surface values</summary>
        <p>
          Actual shared light/dark values from the compiled theme. The surface canvas remains owned
          by Color. Typography, motion, focus settings and component exceptions stay independent.
        </p>
        <section
          className="geometry-table-scroll"
          aria-label="Resolved geometry values"
          tabIndex={0}
        >
          <table>
            <caption>Applied shared geometry, not component exceptions</caption>
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Light</th>
                <th scope="col">Dark</th>
              </tr>
            </thead>
            <tbody>
              {geometryMetrics.map(([name, variable]) => (
                <tr key={variable}>
                  <th scope="row">{name}</th>
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
