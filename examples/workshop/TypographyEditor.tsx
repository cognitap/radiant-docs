'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  Button,
  type TypographyAssignment,
  type TypographyInput,
  type TypographyPreset,
  type TypographyResult,
  type TypographyRole,
  type TypographyStyle
} from '@cognitap/radiant'
import { curatedFonts, type TrialFont } from './workshop-fonts'
import { WorkshopFontLoader } from './font-runtime'
import { FontNumber } from './FontEditor'
import {
  assignments,
  assignmentName,
  assignFamily,
  fontFieldName,
  styleName,
  startingPoints,
  chooseAssignment,
  resetRhythm,
  resetTextStyle,
  setRhythm,
  setStyle,
  applyTypesetting,
  assignedTrial,
  type TypographyFields
} from './workshop-typography'
import { Changed } from './ControlChange'
import type { Change } from './workshop-history'
import type { Changes } from './workshop-fields'
import './typography-editor.css'

const generated = (value: number | string | undefined) =>
  value === undefined ? 'the generated value' : String(value)
const presetName = (id: string | undefined) =>
  startingPoints.find(item => item.id === id)?.name ?? String(id)

const rhythmNames: Record<string, string> = {
  size: 'size',
  lineHeight: 'leading',
  paragraphSpacing: 'paragraph spacing',
  measure: 'measure',
  headingScale: 'heading scale'
}
const zero = () => 0
const noSubscription = () => () => {}

export function TypographyEditor({
  active,
  document,
  result,
  changes,
  loader,
  local,
  selectedRole,
  onSelectRole,
  onChange
}: {
  active: boolean
  document: object
  result: TypographyResult | null
  changes: Changes<TypographyFields> | null
  loader: WorkshopFontLoader | null
  local: TrialFont | null
  selectedRole: string
  onSelectRole: (role: string) => void
  onChange: (document: object, change: Change) => void
}) {
  useSyncExternalStore(loader?.subscribe ?? noSubscription, loader?.snapshot ?? zero, zero)
  const [notice, setNotice] = useState('')
  const [custom, setCustom] = useState('Georgia, serif')
  const [customAssignment, setCustomAssignment] = useState<TypographyAssignment>('body')
  const [fontState, setFontState] = useState({ key: '', message: '' })
  const [retry, setRetry] = useState(0)
  const [fluidModes, setFluidModes] = useState<Record<string, boolean>>({})
  const fonts = result?.input.fonts
  const fontKey = JSON.stringify(fonts)
  useEffect(() => {
    if (!active || !loader || !fonts) return
    let cancelled = false
    const known = assignments.flatMap(assignment => {
      const font = assignedTrial(fonts[assignment]!, local)
      return font ? [font] : []
    })
    const families = [...new Map(known.map(font => [font.family, font] as const)).values()]
    Promise.all(families.filter(font => font.source === 'catalog').map(font => loader.load(font)))
      .then(() => {
        if (!cancelled)
          setFontState({
            key: fontKey,
            message:
              'Assigned curated files are ready. Custom or missing local files use their named fallback; inspect the required scripts.'
          })
      })
      .catch(() => {
        if (!cancelled)
          setFontState({
            key: fontKey,
            message:
              'An assigned font could not load. Fallback is visible; retry or choose another family.'
          })
      })
    return () => {
      cancelled = true
    }
  }, [active, loader, fontKey, fonts, local, retry])
  if (!result)
    return (
      <div
        className="typesetting-editor"
        data-typesetting="uninitialized"
      >
        <h4>Start a typesetting system</h4>
        <p>
          This imported document has no typesetting recipe. Its existing typography is retained.
          Choose a starting point to replace Typography and activate these controls; other sections,
          component exceptions and proof content stay intact.
        </p>
        {startingPoints.map(item => (
          <Button
            key={item.id}
            variant="outline"
            onClick={() =>
              onChange(applyTypesetting(document, { preset: item.id }, local, true), {
                label: 'typography starting point'
              })
            }
          >
            Start with {item.name}
          </Button>
        ))}
      </div>
    )
  const { input, prose, ui } = result
  const role = (
    Object.hasOwn(result.styles, selectedRole) ? selectedRole : 'prose-body'
  ) as TypographyRole
  const style = result.styles[role]
  const fluid = fluidModes[role] ?? style.narrow !== style.wide
  const candidates = [...curatedFonts, ...(local?.styles.includes('normal') ? [local] : [])]
  const warnings = Object.entries(result.styles).flatMap(([name, style]) => {
    const known = assignedTrial(input.fonts![style.assignment]!, local)
    return known && (style.weight < known.weights[0] || style.weight > known.weights[1])
      ? [
          `${styleName(name)} requests ${style.weight}; ${known.family} provides ${known.weights.join('–')}.`
        ]
      : []
  })
  for (const warning of result.warnings)
    if (!warnings.some(text => text.startsWith(styleName(warning.role))))
      warnings.push(
        `${styleName(warning.role)} requests ${warning.requestedWeight}; supported weights are ${warning.supportedWeights.join('–')}.`
      )
  function change(next: TypographyInput, source: Change, reset = false) {
    try {
      onChange(applyTypesetting(document, next, local, reset), source)
      if (reset) setFluidModes({})
      setNotice(
        reset
          ? 'Typography starting point applied. Other sections, component exceptions and proof content retained.'
          : 'Typography updated. Explicit style overrides and other sections retained.'
      )
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Unable to apply typography. Current theme retained.'
      )
    }
  }
  function changeStyle<K extends keyof TypographyStyle>(
    key: K,
    value: TypographyStyle[K] | undefined
  ) {
    change(setStyle(input, role, key, value), {
      label: `${styleName(role)} ${key}`.toLowerCase(),
      coalesce: `style.${role}.${key}`
    })
  }
  const styleField = <K extends keyof TypographyStyle>(key: K) =>
    `style.${role}.${key}` as `style.${TypographyRole}.${K}`
  const styleSize = (value: number | undefined) =>
    change(setStyle(setStyle(input, role, 'narrow', value), role, 'wide', value), {
      label: `${styleName(role)} size`.toLowerCase(),
      coalesce: `style.${role}.size`
    })
  const startingPoint = (preset: TypographyPreset | undefined) =>
    change({ preset }, { label: 'typography starting point' }, true)
  return (
    <div
      className="typesetting-editor"
      data-typesetting="enabled"
    >
      <h4>Typesetting system</h4>
      <p>
        Font assignments, text styles and rhythm are separate decisions. Changes apply to every
        proof through the shared theme. Sizes are reference pixels at a 16px root and compile to
        rem.
      </p>
      <div className="typesetting-controls">
        <Changed
          changes={changes}
          field="preset"
          label="Starting point"
          format={presetName}
          set={startingPoint}
        >
          {describedBy => (
            <label>
              Starting point
              <select
                value={input.preset}
                aria-describedby={describedBy}
                onChange={event => startingPoint(event.target.value as TypographyPreset)}
              >
                {startingPoints.map(item => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </Changed>
        <Button
          variant="outline"
          onClick={() => startingPoint(input.preset)}
        >
          Restore starting point
        </Button>
      </div>
      <p>
        Choosing a starting point resets Typography, including manual rhythm/style settings and
        typography token/mode overrides. Other theme sections and component exceptions stay intact.
      </p>
      <fieldset>
        <legend>Font assignments</legend>
        <div className="typesetting-controls">
          {assignments.map(assignment => {
            const value = input.fonts![assignment]!
            const known = assignedTrial(value, local)
            const label = `${assignmentName(assignment)} assignment`
            return (
              <Changed
                key={assignment}
                changes={changes}
                field={`font.${assignment}`}
                label={label}
                format={fontFieldName}
                set={family =>
                  change(assignFamily(input, assignment, family, local), {
                    label: label.toLowerCase()
                  })
                }
              >
                {describedBy => (
                  <label>
                    {label}
                    <select
                      value={known?.id ?? 'manual'}
                      aria-describedby={describedBy}
                      onChange={event => {
                        const font = candidates.find(item => item.id === event.target.value)
                        if (font)
                          change(chooseAssignment(input, assignment, font), {
                            label: label.toLowerCase()
                          })
                      }}
                    >
                      {!known && (
                        <option value="manual">
                          {value.family} · manual / file may be missing
                        </option>
                      )}
                      {candidates.map(font => (
                        <option
                          key={font.id}
                          value={font.id}
                        >
                          {font.family}
                          {font.source === 'local' ? ' · local, manual' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </Changed>
            )
          })}
        </div>
        <details>
          <summary>Use another installed family or fallback stack</summary>
          <div className="typesetting-controls">
            <label>
              Manual assignment
              <select
                value={customAssignment}
                onChange={event => setCustomAssignment(event.target.value as TypographyAssignment)}
              >
                {assignments.map(assignment => (
                  <option
                    key={assignment}
                    value={assignment}
                  >
                    {assignmentName(assignment)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Manual CSS family
              <input
                value={custom}
                onChange={event => setCustom(event.target.value)}
              />
            </label>
            <Button
              variant="outline"
              onClick={() =>
                change(
                  {
                    ...input,
                    fonts: {
                      ...input.fonts,
                      [customAssignment]: { family: custom, profile: 'manual' }
                    }
                  },
                  { label: `${assignmentName(customAssignment).toLowerCase()} assignment` }
                )
              }
            >
              Use manual family
            </Button>
          </div>
          <p>
            Uncalibrated. Supply files in your app or use an installed family with a fallback. Try a
            local file below to make it available here; bytes never enter the theme.
          </p>
        </details>
        <output>
          {assignments.some(assignment => {
            const known = assignedTrial(input.fonts![assignment]!, local)
            return known?.source === 'catalog' && !loader?.has(known.family)
          })
            ? assignments.some(assignment => {
                const known = assignedTrial(input.fonts![assignment]!, local)
                return known && loader?.isLoading(known.family)
              })
              ? 'Loading assigned curated files… fallback remains visible.'
              : 'An assigned font is missing or could not load. Fallback is visible; retry or choose another family.'
            : fontState.key === fontKey
              ? fontState.message
              : 'Assigned files ready; custom families need their own setup.'}
        </output>
        <Button
          variant="outline"
          onClick={() => setRetry(value => value + 1)}
        >
          Retry assigned fonts
        </Button>
      </fieldset>
      <fieldset>
        <legend>Prose rhythm</legend>
        <p>
          {result.recommendations.body
            ? 'Studied Body starting metrics.'
            : 'Uncalibrated Body assignment — neutral manual metrics.'}{' '}
          Manual rhythm survives family changes; headings use Body’s reference size.
        </p>
        <p>
          Manual prose settings:{' '}
          {Object.keys(input.prose ?? {})
            .map(key => rhythmNames[key])
            .join(', ') || 'none · profile defaults'}
          .
        </p>
        <div className="typesetting-controls">
          {(
            [
              ['size', 'Prose size (px)', 12, 40, 0.5],
              ['lineHeight', 'Prose leading', 1, 3, 0.05],
              ['paragraphSpacing', 'Paragraph spacing (em)', 0, 4, 0.05],
              ['measure', 'Prose measure (ch)', 20, 120, 1],
              ['headingScale', 'Heading scale', 1.1, 1.5, 0.001]
            ] as const
          ).map(([key, label, min, max, step]) => (
            <Changed
              key={key}
              changes={changes}
              field={`prose.${key}`}
              label={label}
              format={generated}
              set={value =>
                change(setRhythm(input, 'prose', key, value), {
                  label: label.toLowerCase(),
                  coalesce: `prose.${key}`
                })
              }
            >
              {describedBy => (
                <FontNumber
                  label={label}
                  value={prose[key]}
                  min={min}
                  max={max}
                  step={step}
                  describedBy={describedBy}
                  onValid={value =>
                    change(setRhythm(input, 'prose', key, value), {
                      label: label.toLowerCase(),
                      coalesce: `prose.${key}`
                    })
                  }
                />
              )}
            </Changed>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => change(resetRhythm(input, 'prose'), { label: 'prose rhythm' })}
        >
          Reset prose rhythm
        </Button>
      </fieldset>
      <fieldset>
        <legend>UI rhythm</legend>
        <p>
          {result.recommendations.ui
            ? 'Studied UI starting metrics.'
            : 'Uncalibrated UI assignment — neutral manual metrics.'}{' '}
          Control dimensions and layout gaps belong to Spacing & surfaces. Manual UI settings:{' '}
          {Object.keys(input.ui ?? {})
            .map(key => rhythmNames[key])
            .join(', ') || 'none · profile defaults'}
          .
        </p>
        <div className="typesetting-controls">
          {(
            [
              ['size', 'UI size (px)', 12, 32, 0.5],
              ['lineHeight', 'UI leading', 1, 3, 0.05]
            ] as const
          ).map(([key, label, min, max, step]) => (
            <Changed
              key={key}
              changes={changes}
              field={`ui.${key}`}
              label={label}
              format={generated}
              set={value =>
                change(setRhythm(input, 'ui', key, value), {
                  label: label.toLowerCase(),
                  coalesce: `ui.${key}`
                })
              }
            >
              {describedBy => (
                <FontNumber
                  label={label}
                  value={ui[key]}
                  min={min}
                  max={max}
                  step={step}
                  describedBy={describedBy}
                  onValid={value =>
                    change(setRhythm(input, 'ui', key, value), {
                      label: label.toLowerCase(),
                      coalesce: `ui.${key}`
                    })
                  }
                />
              )}
            </Changed>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => change(resetRhythm(input, 'ui'), { label: 'UI rhythm' })}
        >
          Reset UI rhythm
        </Button>
      </fieldset>
      <fieldset className="typesetting-inspector">
        <legend>Text style inspector</legend>
        <p>
          Choose a style, or turn on Inspect above the preview and click text. Local headings
          interpolate over 24–56rem of content width. Fixed styles keep equal endpoints; measure 0
          lets layout own the width.
        </p>
        <label>
          Text style
          <select
            value={role}
            onChange={event => onSelectRole(event.target.value)}
          >
            {(Object.keys(result.styles) as TypographyRole[]).map(name => (
              <option
                key={name}
                value={name}
              >
                {styleName(name)}
                {input.styles?.[name] && Object.keys(input.styles[name]).length
                  ? ' · overridden'
                  : ''}
              </option>
            ))}
          </select>
        </label>
        <div className="typesetting-controls">
          <Changed
            changes={changes}
            field={styleField('assignment')}
            label="Style assignment"
            format={generated}
            set={value => changeStyle('assignment', value)}
          >
            {describedBy => (
              <label>
                Style assignment
                <select
                  value={style.assignment}
                  aria-describedby={describedBy}
                  onChange={event =>
                    changeStyle('assignment', event.target.value as TypographyAssignment)
                  }
                >
                  {assignments.map(item => (
                    <option
                      key={item}
                      value={item}
                    >
                      {assignmentName(item)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </Changed>
          <label className="typesetting-fluid">
            <input
              type="checkbox"
              checked={fluid}
              onChange={event => {
                setFluidModes(previous => ({ ...previous, [role]: event.target.checked }))
                if (!event.target.checked) styleSize(style.narrow)
              }}
            />
            Responsive endpoints
          </label>
          {fluid ? (
            <>
              <Changed
                key={`${role}:narrow`}
                changes={changes}
                field={styleField('narrow')}
                label="Narrow size (px)"
                format={generated}
                set={value => changeStyle('narrow', value)}
              >
                {describedBy => (
                  <FontNumber
                    label="Narrow size (px)"
                    value={style.narrow}
                    min={8}
                    max={Math.min(256, style.wide)}
                    step={0.5}
                    describedBy={describedBy}
                    onValid={value => changeStyle('narrow', value)}
                  />
                )}
              </Changed>
              <Changed
                key={`${role}:wide`}
                changes={changes}
                field={styleField('wide')}
                label="Wide size (px)"
                format={generated}
                set={value => changeStyle('wide', value)}
              >
                {describedBy => (
                  <FontNumber
                    label="Wide size (px)"
                    value={style.wide}
                    min={style.narrow}
                    max={512}
                    step={0.5}
                    describedBy={describedBy}
                    onValid={value => changeStyle('wide', value)}
                  />
                )}
              </Changed>
            </>
          ) : (
            <Changed
              key={`${role}:fixed`}
              changes={changes}
              field={styleField('narrow')}
              label="Style size (px)"
              format={generated}
              set={styleSize}
            >
              {describedBy => (
                <FontNumber
                  label="Style size (px)"
                  value={style.narrow}
                  min={8}
                  max={256}
                  step={0.5}
                  describedBy={describedBy}
                  onValid={styleSize}
                />
              )}
            </Changed>
          )}
          {(
            [
              ['weight', 'Style weight', 1, 1000, 1],
              ['lineHeight', 'Style leading', 0.8, 3, 0.05],
              ['tracking', 'Style tracking (em)', -0.2, 0.5, 0.005],
              ['measure', 'Style measure (ch)', 0, 120, 1]
            ] as const
          ).map(([key, label, min, max, step]) => (
            <Changed
              key={`${role}:${key}`}
              changes={changes}
              field={styleField(key)}
              label={label}
              format={generated}
              set={value => changeStyle(key, value)}
            >
              {describedBy => (
                <FontNumber
                  label={label}
                  value={style[key]}
                  min={min}
                  max={max}
                  step={step}
                  describedBy={describedBy}
                  onValid={value => changeStyle(key, value)}
                />
              )}
            </Changed>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setFluidModes(previous => {
              const next = { ...previous }
              delete next[role]
              return next
            })
            change(resetTextStyle(input, role), { label: `${styleName(role)} style`.toLowerCase() })
          }}
        >
          Reset selected style
        </Button>
        <p>
          {input.styles?.[role] && Object.keys(input.styles[role]).length
            ? 'Explicit style settings survive rhythm and family changes.'
            : 'This style follows generated defaults.'}{' '}
          Authored typography token/mode overrides can still take precedence; a starting-point reset
          clears them.
        </p>
      </fieldset>
      {warnings.length > 0 && (
        <div
          role="alert"
          className="typesetting-warning"
        >
          <p>
            Requested weights are retained; rendering may use a nearby weight. Font synthesis is
            disabled for production text styles.
          </p>
          <ul>
            {warnings.map(message => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <p>
        Curated and local files load only in this session. Imported family names do not supply
        files. Real italic needs its matching face; axis experiments below stay sample-only. The
        current component release may retain legacy control typography until its role adoption.
      </p>
      <output className="typesetting-notice">{notice}</output>
    </div>
  )
}
