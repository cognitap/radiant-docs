'use client'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Named scrolling data regions need keyboard access. */

import { useId, useState } from 'react'
import { Button, Checkbox, Field, Input } from '@cognitap/radiant'
import {
  chooseWorkingFamily,
  colorPresets,
  selectColorPreset,
  overrideRole,
  roleNames,
  roleValue,
  workingRoles,
  type ColorFields,
  type ColorRecipe,
  type ColorSession,
  type Mode,
  type Role
} from './workshop-color'
import { Changed } from './ControlChange'
import type { ControlTarget } from './workshop-inspect'
import type { Change } from './workshop-history'
import type { Changes } from './workshop-fields'
import './color-editor.css'

const automatic = (value: number | string | undefined) =>
  value === undefined ? 'automatic' : String(value)
const recommended = (value: string | undefined) => value ?? 'recommended'
const presetName = (id: string) => colorPresets.find(preset => preset.id === id)?.name ?? id

function HexField({
  label,
  value,
  disabled,
  describedBy,
  onValid
}: {
  label: string
  value: string
  disabled?: boolean
  describedBy?: string
  onValid: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  const [previousValue, setPreviousValue] = useState(value)
  if (previousValue !== value) {
    setPreviousValue(value)
    setDraft(value)
  }
  const valid = /^#[0-9a-f]{6}$/i.test(draft)
  return (
    <div className="color-hex-field">
      <Field
        label={label}
        error={
          !valid
            ? 'Use six-digit sRGB hex, such as #7C3AED. The last valid theme is still shown.'
            : undefined
        }
      >
        <Input
          value={draft}
          disabled={disabled}
          aria-describedby={describedBy}
          spellCheck={false}
          maxLength={80}
          onChange={event => {
            setDraft(event.target.value)
            if (/^#[0-9a-f]{6}$/i.test(event.target.value)) onValid(event.target.value)
          }}
        />
      </Field>
      <label className="color-picker-label">
        Pick {label.toLowerCase()}
        <input
          type="color"
          aria-label={`${label} picker`}
          aria-describedby={describedBy}
          value={value}
          disabled={disabled}
          onChange={event => {
            setDraft(event.target.value)
            onValid(event.target.value)
          }}
        />
      </label>
    </div>
  )
}
function Dial({
  label,
  value,
  min,
  max,
  step,
  disabled,
  describedBy,
  onChange
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  disabled?: boolean
  describedBy?: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <label
      className="color-dial"
      htmlFor={id}
    >
      <span>
        {label}: <strong>{Number(value.toFixed(3))}</strong>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={event => onChange(Number(event.target.value))}
      />
    </label>
  )
}
function Chip({ value }: { value: string }) {
  return (
    <span className="color-chip">
      <i
        style={{ backgroundColor: value }}
        aria-hidden="true"
      />
      <code>{value}</code>
    </span>
  )
}

export function ColorEditor({
  session,
  changes,
  disabled,
  target,
  onChange
}: {
  session: ColorSession | null
  changes: Changes<ColorFields> | null
  disabled: boolean
  target?: ControlTarget
  onChange: (recipe: ColorRecipe, change: Change) => void
}) {
  const presetsId = useId()
  const [mode, setMode] = useState<Mode>('light')
  const [role, setRole] = useState<Role>('accent')
  const [seen, setSeen] = useState(target)
  if (target !== seen) {
    setSeen(target)
    const [, targetMode, targetRole] = target?.field.split('.') ?? []
    if (
      (targetMode === 'light' || targetMode === 'dark') &&
      targetRole &&
      Object.hasOwn(roleNames, targetRole)
    ) {
      setMode(targetMode)
      setRole(targetRole as Role)
    }
  }
  const [family, setFamily] = useState('brand')
  const [stop, setStop] = useState(500)
  if (!session)
    return (
      <div className="color-editor">
        <p>
          Imported colors are preserved exactly. This document has no matching generator recipe. Use
          Reset color to start the default brand recipe; this replaces the imported color system
          while retaining other sections.
        </p>
      </div>
    )
  const { recipe, wall, palette } = session
  const { input } = recipe
  const changeInput = (patch: Partial<ColorRecipe['input']>, change: Change) =>
    onChange({ ...recipe, input: { ...input, ...patch } }, change)
  const roleField = `role.${mode}.${role}` as const
  const choose = (value: string | undefined, coalesce?: string) =>
    onChange(overrideRole(recipe, mode, role, value), {
      label: `${mode} ${roleNames[role].toLowerCase()}`,
      coalesce
    })
  const dial = (
    field: 'distribution' | 'neutralTint' | 'hueAlignment',
    label: string,
    min: number,
    max: number,
    step: number
  ) => {
    const set = (value: number) =>
      changeInput({ [field]: value }, { label: label.toLowerCase(), coalesce: field })
    return (
      <Changed
        changes={changes}
        field={field}
        label={label}
        set={set}
      >
        {describedBy => (
          <Dial
            label={label}
            value={wall.input[field]}
            min={min}
            max={max}
            step={step}
            describedBy={describedBy}
            onChange={set}
          />
        )}
      </Changed>
    )
  }
  const selectedPalette = wall.color.palettes.find(p => p.id === family)!
  const selectedSwatch = selectedPalette.swatches.find(s => s.stop === stop)!
  const failures = palette.checks.filter(check => check.pass === false)
  const required = palette.checks.filter(check => check.minimum !== null)
  return (
    <div className="color-editor">
      <fieldset
        disabled={disabled}
        className="color-generator"
      >
        <legend>Brand and generator</legend>
        <Changed
          changes={changes}
          field="brand"
          label="Brand color"
          set={brand => changeInput({ brand }, { label: 'brand color', coalesce: 'brand' })}
        >
          {describedBy => (
            <HexField
              label="Brand color"
              value={input.brand}
              describedBy={describedBy}
              onValid={brand => changeInput({ brand }, { label: 'brand color', coalesce: 'brand' })}
            />
          )}
        </Changed>
        <p>
          sRGB input and output. Alpha and Display P3 sources are not supported by this version.
        </p>
        <p>
          Choose wall and brand-ramp presets independently. Dials customize the selected treatment;
          choosing a preset resets its own dials and keeps your pinned semantic colors. Action fills
          use the nearest readable brand shade in each mode.
        </p>
        <div className="color-controls">
          {(['wall', 'ramp'] as const).map(section => {
            const label = section === 'wall' ? 'Wall preset' : 'Brand ramp preset'
            const field = section === 'wall' ? 'wallPreset' : 'rampPreset'
            const select = (preset: string) =>
              onChange(
                selectColorPreset(recipe, section, colorPresets.find(p => p.id === preset)!.id),
                { label: label.toLowerCase() }
              )
            return (
              <Changed
                key={section}
                changes={changes}
                field={field}
                label={label}
                format={presetName}
                set={select}
              >
                {describedBy => (
                  <label className="color-preset">
                    {label}
                    <select
                      aria-label={label}
                      aria-describedby={[`${presetsId}-${section}`, describedBy]
                        .filter(Boolean)
                        .join(' ')}
                      value={wall.input[field]}
                      onChange={event => select(event.target.value)}
                    >
                      {colorPresets.map(preset => (
                        <option
                          key={preset.id}
                          value={preset.id}
                        >
                          {preset.name}
                        </option>
                      ))}
                    </select>
                    <small id={`${presetsId}-${section}`}>
                      {colorPresets.find(p => p.id === wall.input[field])?.description}
                    </small>
                  </label>
                )}
              </Changed>
            )
          })}
          <Changed
            changes={changes}
            field="fidelity"
            label="Brand fidelity"
            set={fidelity => changeInput({ fidelity }, { label: 'brand fidelity' })}
          >
            {describedBy => (
              <label>
                Brand fidelity
                <select
                  value={wall.input.fidelity}
                  aria-describedby={describedBy}
                  onChange={event =>
                    changeInput(
                      { fidelity: event.target.value === 'unanchored' ? 'unanchored' : 'anchored' },
                      { label: 'brand fidelity' }
                    )
                  }
                >
                  <option value="anchored">Exact brand anchor</option>
                  <option value="unanchored">Regular ramp</option>
                </select>
              </label>
            )}
          </Changed>
          <Changed
            changes={changes}
            field="lightness"
            label="Lightness model"
            set={lightness => changeInput({ lightness }, { label: 'lightness model' })}
          >
            {describedBy => (
              <label>
                Lightness model
                <select
                  value={wall.input.lightness}
                  aria-describedby={describedBy}
                  onChange={event =>
                    changeInput(
                      { lightness: event.target.value === 'shared' ? 'shared' : 'hue-aware' },
                      { label: 'lightness model' }
                    )
                  }
                >
                  <option value="hue-aware">Hue aware</option>
                  <option value="shared">Shared stops</option>
                </select>
              </label>
            )}
          </Changed>
          <Changed
            changes={changes}
            field="vividness"
            label="Wall vividness"
            format={automatic}
            set={vividness =>
              changeInput({ vividness }, { label: 'wall vividness', coalesce: 'vividness' })
            }
          >
            {describedBy => (
              <>
                <Checkbox
                  label="Automatic wall vividness"
                  checked={input.vividness === undefined}
                  aria-describedby={describedBy}
                  onChange={event =>
                    changeInput(
                      { vividness: event.target.checked ? undefined : wall.input.vividness },
                      { label: 'wall vividness' }
                    )
                  }
                />
                <Dial
                  label="Wall vividness"
                  value={wall.input.vividness}
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={input.vividness === undefined}
                  describedBy={describedBy}
                  onChange={vividness =>
                    changeInput({ vividness }, { label: 'wall vividness', coalesce: 'vividness' })
                  }
                />
              </>
            )}
          </Changed>
          <Changed
            changes={changes}
            field="brandVividness"
            label="Brand vividness"
            format={automatic}
            set={brandVividness =>
              changeInput(
                { brandVividness },
                { label: 'brand vividness', coalesce: 'brandVividness' }
              )
            }
          >
            {describedBy => (
              <>
                <Checkbox
                  label="Automatic brand vividness"
                  checked={input.brandVividness === undefined}
                  aria-describedby={describedBy}
                  onChange={event =>
                    changeInput(
                      {
                        brandVividness: event.target.checked ? undefined : wall.input.brandVividness
                      },
                      { label: 'brand vividness' }
                    )
                  }
                />
                <Dial
                  label="Brand vividness"
                  value={wall.input.brandVividness}
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={input.brandVividness === undefined}
                  describedBy={describedBy}
                  onChange={brandVividness =>
                    changeInput(
                      { brandVividness },
                      { label: 'brand vividness', coalesce: 'brandVividness' }
                    )
                  }
                />
              </>
            )}
          </Changed>
          {dial('distribution', 'Tone distribution', 0.75, 1.35, 0.01)}
          {dial('neutralTint', 'Neutral tint', 0, 0.035, 0.001)}
          {dial('hueAlignment', 'Hue alignment', 0, 1, 0.05)}
          <Changed
            changes={changes}
            field="neutralHue"
            label="Neutral hue direction"
            set={neutralHue =>
              changeInput(
                { neutralHue },
                { label: 'neutral hue direction', coalesce: 'neutralHue' }
              )
            }
          >
            {describedBy => (
              <Dial
                label="Neutral hue direction"
                value={wall.input.neutralHue}
                min={0}
                max={359}
                step={1}
                disabled={!wall.neutralInput}
                describedBy={describedBy}
                onChange={neutralHue =>
                  changeInput(
                    { neutralHue },
                    { label: 'neutral hue direction', coalesce: 'neutralHue' }
                  )
                }
              />
            )}
          </Changed>
        </div>
      </fieldset>
      <p
        className="color-fidelity"
        data-testid="color-fidelity"
      >
        <strong>
          Original <code>{wall.color.brand.value}</code>.
        </strong>{' '}
        {wall.color.anchor ? (
          <>
            Retained exactly at {wall.color.anchor.paletteId} {wall.color.anchor.stop}; neighboring
            shades reshape around it.
          </>
        ) : (
          <>Retained as reference metadata; the regular ramp follows its own stops.</>
        )}{' '}
        Semantic roles can use related shades for contrast.{' '}
        {wall.neutralInput && 'Neutral hue direction sets the wall’s low-chroma hue.'}
      </p>
      <details
        className="color-working"
        open
      >
        <summary>Working palette · six families</summary>
        <p>
          Family choices guide automatic roles. Exact role overrides stay pinned until you clear
          them. Support and success are working colors; they do not add component tones.
        </p>
        <div className="color-working-grid">
          {workingRoles.map(name => (
            <div
              className="color-working-choice"
              key={name}
            >
              <Changed
                changes={changes}
                field={`working.${name}`}
                label={`${name} family`}
                format={recommended}
                set={paletteId =>
                  onChange(chooseWorkingFamily(recipe, name, paletteId), {
                    label: `${name} family`
                  })
                }
              >
                {describedBy => (
                  <label>
                    {name} family
                    <select
                      aria-label={`${name} family`}
                      aria-describedby={describedBy}
                      disabled={disabled}
                      value={palette.working[name].paletteId}
                      onChange={event =>
                        onChange(chooseWorkingFamily(recipe, name, event.target.value), {
                          label: `${name} family`
                        })
                      }
                    >
                      {wall.color.palettes.map(p => (
                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </Changed>
              {(['light', 'dark'] as const).map(m => (
                <div key={m}>
                  <small>{m}</small>
                  <Chip value={palette.working[name][m].background} />
                  <span className="color-on-value">text {palette.working[name][m].foreground}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          disabled={disabled || !recipe.working}
          onClick={() =>
            onChange({ ...recipe, working: undefined }, { label: 'recommended families' })
          }
        >
          Use recommended families
        </Button>
      </details>
      <fieldset
        disabled={disabled}
        className="color-role-editor"
      >
        <legend>Semantic role adjustment</legend>
        <p>
          Choose a role and mode, then enter hex or choose a wall shade. Role mode is separate from
          specimen preview mode.
        </p>
        <div className="color-controls">
          <label>
            Role mode
            <select
              value={mode}
              onChange={event => setMode(event.target.value === 'dark' ? 'dark' : 'light')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Semantic role
            <select
              value={role}
              onChange={event => {
                if (Object.hasOwn(roleNames, event.target.value))
                  setRole(event.target.value as Role)
              }}
            >
              {Object.entries(roleNames).map(([key, name]) => (
                <option
                  value={key}
                  key={key}
                >
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Changed
          changes={changes}
          field={roleField}
          label="Exact role color"
          format={automatic}
          set={value => choose(value)}
        >
          {describedBy => (
            <HexField
              key={`${mode}:${role}`}
              label="Exact role color"
              value={roleValue(session, mode, role)}
              describedBy={describedBy}
              onValid={value => choose(value, roleField)}
            />
          )}
        </Changed>
        <p>
          <strong>{recipe.modes?.[mode]?.[role] ? 'Explicit override' : 'Automatic choice'}</strong>{' '}
          · {mode} {roleNames[role]} <Chip value={roleValue(session, mode, role)} />
        </p>
        <div className="workshop-actions">
          <Button
            variant="outline"
            disabled={!recipe.modes?.[mode]?.[role]}
            onClick={() => choose(undefined)}
          >
            Clear role override
          </Button>
          <Button
            variant="outline"
            disabled={!recipe.modes}
            onClick={() => onChange({ ...recipe, modes: undefined }, { label: 'automatic roles' })}
          >
            Use automatic roles
          </Button>
        </div>
        <div className="color-controls color-wall-choice">
          <label>
            Wall family
            <select
              value={family}
              onChange={event => setFamily(event.target.value)}
            >
              {wall.color.palettes.map(p => (
                <option
                  value={p.id}
                  key={p.id}
                >
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Wall stop
            <select
              value={stop}
              onChange={event => setStop(Number(event.target.value))}
            >
              {selectedPalette.swatches.map(s => (
                <option
                  key={s.stop}
                  value={s.stop}
                >
                  {s.stop} · {s.value}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={() => choose(selectedSwatch.value)}>Apply selected shade</Button>
        </div>
      </fieldset>
      <details
        className="color-wall-details"
        open
      >
        <summary>Complete color wall · {wall.color.palettes.length} families</summary>
        <p>
          Use the family and stop selectors above for keyboard selection, or click any swatch to set
          the selected semantic role. Original and all supporting colors remain available.
        </p>
        <section
          className="color-wall-scroll"
          aria-label="Complete color wall"
          tabIndex={0}
        >
          <table className="color-wall">
            <caption>
              All generated shades · choose for {mode} {roleNames[role]}
            </caption>
            <thead>
              <tr>
                <th scope="col">Family</th>
                {wall.color.palettes[0].swatches.map(s => (
                  <th
                    scope="col"
                    key={s.stop}
                  >
                    {s.stop}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wall.color.palettes.map(p => (
                <tr key={p.id}>
                  <th scope="row">{p.name}</th>
                  {p.swatches.map(s => (
                    <td key={s.stop}>
                      <button
                        type="button"
                        tabIndex={-1}
                        disabled={disabled}
                        className="color-swatch"
                        style={{ backgroundColor: s.value }}
                        aria-label={`Use ${p.name} ${s.stop} ${s.value} for ${mode} ${roleNames[role]}`}
                        aria-pressed={recipe.modes?.[mode]?.[role] === s.value}
                        onClick={() => {
                          setFamily(p.id)
                          setStop(s.stop)
                          choose(s.value)
                        }}
                      />
                      <code>{s.value}</code>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </details>
      <section
        className="color-contrast"
        aria-label="Color contrast report"
      >
        <h4>Contrast for actual semantic pairs</h4>
        <output className="color-contrast-summary">
          {failures.length
            ? `${failures.length} required pairs need attention.`
            : `${required.length} required pairs pass.`}{' '}
          {palette.checks.length - required.length} inactive-control observations.
        </output>
        <p>
          Checks use final opaque sRGB values and unrounded thresholds. Apply color and canvas
          together. Component overrides, translucent surfaces and rendered effects need inspection
          in the real specimens. Pending actions remain subject to contrast requirements.
        </p>
        {failures.length > 0 && (
          <ul className="color-failures">
            {failures.map(check => (
              <li key={`${check.mode}:${check.foregroundRole}:${check.backgroundRole}`}>
                <strong>
                  {check.mode} · {check.foregroundRole} on {check.backgroundRole}
                </strong>
                : {check.ratio.toFixed(4)}:1. {check.message}
              </li>
            ))}
          </ul>
        )}
        <details>
          <summary>All {palette.checks.length} pair measurements</summary>
          <section
            className="color-data-scroll"
            aria-label="Contrast measurements"
            tabIndex={0}
          >
            <table>
              <caption>Measured foreground/background pairs</caption>
              <thead>
                <tr>
                  <th>Mode and pair</th>
                  <th>Colors</th>
                  <th>Ratio</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {palette.checks.map(c => (
                  <tr key={`${c.mode}:${c.foregroundRole}:${c.backgroundRole}`}>
                    <th scope="row">
                      {c.mode} · {c.foregroundRole} / {c.backgroundRole}
                    </th>
                    <td>
                      {c.foreground} / {c.background}
                    </td>
                    <td>{c.ratio.toFixed(4)}:1</td>
                    <td>
                      {c.pass === null
                        ? 'Informational: inactive control'
                        : c.pass
                          ? `Pass ≥ ${c.minimum}:1`
                          : `Fail < ${c.minimum}:1`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </details>
      </section>
      <details className="color-role-values">
        <summary>Semantic light/dark roles</summary>
        <section
          className="color-data-scroll"
          aria-label="Semantic role values"
          tabIndex={0}
        >
          <table>
            <caption>Applied semantic role values</caption>
            <thead>
              <tr>
                <th>Role</th>
                <th>Light</th>
                <th>Dark</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(roleNames) as Role[]).map(name => (
                <tr key={name}>
                  <th scope="row">{roleNames[name]}</th>
                  <td>
                    <Chip value={roleValue(session, 'light', name)} />
                  </td>
                  <td>
                    <Chip value={roleValue(session, 'dark', name)} />
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
