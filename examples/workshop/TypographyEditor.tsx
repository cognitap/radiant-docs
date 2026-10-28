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
import { ScrubField } from './ScrubField'
import { Chips, FaceCards, RoleList } from './TypographyPickers'
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
import {
  assignmentOptions,
  familyOptions,
  overridden,
  pairingOptions,
  proseScrubs,
  roleOrder,
  sizeScrub,
  specimen,
  styleScrubs,
  uiScrubs,
  weightWarnings
} from './workshop-typography-view'
import { Changed } from './ControlChange'
import type { Change } from './workshop-history'
import type { Changes } from './workshop-fields'
import './typography-editor.css'

const generated = (value: number | string | undefined) =>
  value === undefined ? 'the generated value' : String(value)
const presetName = (id: string | undefined) =>
  startingPoints.find(item => item.id === id)?.name ?? String(id)
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
  const [retry, setRetry] = useState(0)
  const [fluidModes, setFluidModes] = useState<Record<string, boolean>>({})
  const fonts = result?.input.fonts
  const fontKey = JSON.stringify(fonts)
  useEffect(() => {
    if (!active || !loader) return
    const wanted = new Map(curatedFonts.map(font => [font.family, font] as const))
    for (const assignment of assignments) {
      const font = fonts && assignedTrial(fonts[assignment]!, local)
      if (font) wanted.set(font.family, font)
    }
    for (const font of wanted.values())
      if (font.source === 'catalog') loader.load(font).catch(() => {})
  }, [active, loader, fontKey, fonts, local, retry])
  if (!result)
    return (
      <div
        className="typesetting-editor"
        data-typesetting="uninitialized"
      >
        <p className="typesetting-lead">
          This document keeps its own typography. Start a typesetting system to edit it here.
        </p>
        <div className="typesetting-row">
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
      </div>
    )
  const { input, prose, ui } = result
  const role = (
    Object.hasOwn(result.styles, selectedRole) ? selectedRole : 'prose-body'
  ) as TypographyRole
  const style = result.styles[role]
  const fluid = fluidModes[role] ?? style.narrow !== style.wide
  const candidates = [...curatedFonts, ...(local?.styles.includes('normal') ? [local] : [])]
  const warnings = weightWarnings(result, local)
  const failed = assignments.some(assignment => {
    const known = assignedTrial(input.fonts![assignment]!, local)
    return (
      known?.source === 'catalog' && !loader?.has(known.family) && !loader?.isLoading(known.family)
    )
  })
  function change(next: TypographyInput, source: Change, reset = false) {
    try {
      onChange(applyTypesetting(document, next, local, reset), source)
      if (reset) setFluidModes({})
      setNotice('')
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
  const rhythm =
    (context: 'prose' | 'ui', key: string, label: string) => (value: number | undefined) =>
      change(setRhythm(input, context, key as 'size', value), {
        label: label.toLowerCase(),
        coalesce: `${context}.${key}`
      })
  const rows = roleOrder(result).map(name => ({
    role: name,
    name: styleName(name),
    specimen: specimen(result.styles[name], input.fonts!, local, loader),
    overridden: overridden(input, name)
  }))
  return (
    <div
      className="typesetting-editor"
      data-typesetting="enabled"
    >
      <section className="typesetting-section">
        <div className="typesetting-head">
          <h4>Starting point</h4>
          <button
            type="button"
            className="typesetting-link"
            onClick={() => startingPoint(input.preset)}
          >
            Restore starting point
          </button>
        </div>
        <Changed
          changes={changes}
          field="preset"
          label="Starting point"
          format={presetName}
          set={startingPoint}
        >
          {describedBy => (
            <FaceCards
              label="Starting point"
              options={pairingOptions(local, loader)}
              value={input.preset ?? 'inter'}
              describedBy={describedBy}
              onChange={value => startingPoint(value as TypographyPreset)}
            />
          )}
        </Changed>
      </section>
      <section className="typesetting-section">
        <div className="typesetting-head">
          <h4>Fonts</h4>
          {failed && (
            <button
              type="button"
              className="typesetting-link"
              onClick={() => {
                for (const font of curatedFonts) loader?.remove(font.family)
                setRetry(value => value + 1)
              }}
            >
              Retry assigned fonts
            </button>
          )}
        </div>
        {assignments.map(assignment => {
          const value = input.fonts![assignment]!
          const known = assignedTrial(value, local)
          const label = `${assignmentName(assignment)} assignment`
          return (
            <div
              key={assignment}
              className="typesetting-assignment"
            >
              <span className="typesetting-assignment-name">
                {assignmentName(assignment)}
                {value.profile === 'manual' && (
                  <small className="typesetting-badge">Uncalibrated</small>
                )}
              </span>
              <Changed
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
                  <FaceCards
                    label={label}
                    options={familyOptions(candidates, value, local, loader)}
                    value={known?.id ?? 'manual'}
                    describedBy={describedBy}
                    onChange={id => {
                      const font = candidates.find(item => item.id === id)
                      if (font)
                        change(chooseAssignment(input, assignment, font), {
                          label: label.toLowerCase()
                        })
                    }}
                  />
                )}
              </Changed>
            </div>
          )
        })}
        <details className="typesetting-manual">
          <summary>Other family</summary>
          <div className="typesetting-row">
            <label>
              Manual assignment
              <select
                value={customAssignment}
                onChange={event => setCustomAssignment(event.target.value as TypographyAssignment)}
              >
                {assignmentOptions.map(option => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="typesetting-grow">
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
        </details>
      </section>
      <section className="typesetting-section">
        <div className="typesetting-head">
          <h4>Prose rhythm</h4>
          <button
            type="button"
            className="typesetting-link"
            onClick={() => change(resetRhythm(input, 'prose'), { label: 'prose rhythm' })}
          >
            Reset prose rhythm
          </button>
        </div>
        <div className="typesetting-scrubs">
          {proseScrubs.map(scrub => (
            <Changed
              key={scrub.key}
              changes={changes}
              field={`prose.${scrub.key}`}
              label={scrub.name}
              format={generated}
              set={rhythm('prose', scrub.key, scrub.name)}
            >
              {describedBy => (
                <ScrubField
                  scrub={scrub}
                  value={prose[scrub.key]}
                  describedBy={describedBy}
                  onChange={rhythm('prose', scrub.key, scrub.name)}
                />
              )}
            </Changed>
          ))}
        </div>
        <div className="typesetting-head">
          <h4>UI rhythm</h4>
          <button
            type="button"
            className="typesetting-link"
            onClick={() => change(resetRhythm(input, 'ui'), { label: 'UI rhythm' })}
          >
            Reset UI rhythm
          </button>
        </div>
        <div className="typesetting-scrubs">
          {uiScrubs.map(scrub => (
            <Changed
              key={scrub.key}
              changes={changes}
              field={`ui.${scrub.key}`}
              label={scrub.name}
              format={generated}
              set={rhythm('ui', scrub.key, scrub.name)}
            >
              {describedBy => (
                <ScrubField
                  scrub={scrub}
                  value={ui[scrub.key]}
                  describedBy={describedBy}
                  onChange={rhythm('ui', scrub.key, scrub.name)}
                />
              )}
            </Changed>
          ))}
        </div>
      </section>
      <section className="typesetting-section typesetting-inspector">
        <div className="typesetting-head">
          <h4>Text styles</h4>
          <button
            type="button"
            className="typesetting-link"
            onClick={() => {
              setFluidModes(previous => {
                const next = { ...previous }
                delete next[role]
                return next
              })
              change(resetTextStyle(input, role), {
                label: `${styleName(role)} style`.toLowerCase()
              })
            }}
          >
            Reset selected style
          </button>
        </div>
        <RoleList
          rows={rows}
          value={role}
          onChange={onSelectRole}
        />
        <div
          className="typesetting-style"
          data-role={role}
        >
          <Changed
            changes={changes}
            field={styleField('assignment')}
            label="Style assignment"
            format={generated}
            set={value => changeStyle('assignment', value)}
          >
            {describedBy => (
              <Chips
                label="Style assignment"
                options={assignmentOptions}
                value={style.assignment}
                describedBy={describedBy}
                onChange={value => changeStyle('assignment', value as TypographyAssignment)}
              />
            )}
          </Changed>
          <div className="typesetting-endpoints">
            <label className="chip typesetting-fluid">
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
                    <ScrubField
                      scrub={sizeScrub('Narrow size (px)', 8, Math.min(256, style.wide))}
                      value={style.narrow}
                      describedBy={describedBy}
                      onChange={value => changeStyle('narrow', value)}
                    />
                  )}
                </Changed>
                <span
                  className="typesetting-span"
                  aria-hidden="true"
                  style={{
                    ['--narrow' as string]: style.narrow / 128,
                    ['--wide' as string]: style.wide / 128
                  }}
                />
                <Changed
                  key={`${role}:wide`}
                  changes={changes}
                  field={styleField('wide')}
                  label="Wide size (px)"
                  format={generated}
                  set={value => changeStyle('wide', value)}
                >
                  {describedBy => (
                    <ScrubField
                      scrub={sizeScrub('Wide size (px)', style.narrow, 512)}
                      value={style.wide}
                      describedBy={describedBy}
                      onChange={value => changeStyle('wide', value)}
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
                  <ScrubField
                    scrub={sizeScrub('Style size (px)', 8, 256)}
                    value={style.narrow}
                    describedBy={describedBy}
                    onChange={styleSize}
                  />
                )}
              </Changed>
            )}
          </div>
          <div className="typesetting-scrubs">
            {styleScrubs.map(scrub => (
              <Changed
                key={`${role}:${scrub.key}`}
                changes={changes}
                field={styleField(scrub.key)}
                label={scrub.name}
                format={generated}
                set={value => changeStyle(scrub.key, value)}
              >
                {describedBy => (
                  <ScrubField
                    scrub={scrub}
                    value={style[scrub.key]}
                    describedBy={describedBy}
                    onChange={value => changeStyle(scrub.key, value)}
                  />
                )}
              </Changed>
            ))}
          </div>
        </div>
      </section>
      {warnings.length > 0 && (
        <ul
          role="alert"
          className="typesetting-warning"
        >
          {warnings.map(message => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <output className="typesetting-notice">{notice}</output>
    </div>
  )
}
