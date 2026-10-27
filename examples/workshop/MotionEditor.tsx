'use client'

import { useId, useState } from 'react'
import { Button, Field, Input, defineMotionProfile, type SpringParameters } from '@cognitap/radiant'
import {
  applyMotion,
  authoredMotion,
  changeMotion,
  chooseMotionPreset,
  inheritMotion,
  matchingMotionPreset,
  motionDials,
  motionPresets,
  motionScopes,
  type MotionScope
} from './workshop-motion'
import './motion-editor.css'

function PhysicsDial({
  dial,
  value,
  onChange
}: {
  dial: (typeof motionDials)[number]
  value: number
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  const [previous, setPrevious] = useState(value)
  if (previous !== value) {
    setPrevious(value)
    setDraft(String(value))
  }
  const next = Number(draft)
  const valid = !!draft.trim() && Number.isFinite(next) && next > 0 && next <= dial.max
  const id = useId()
  const minimum = 0.01
  const toPosition = (number: number) =>
    Math.max(0, Math.min(1000, (Math.log(number / minimum) / Math.log(dial.max / minimum)) * 1000))
  return (
    <div className="motion-dial">
      <Field
        label={dial.label}
        description={dial.help}
        error={
          valid
            ? undefined
            : `Enter a value above 0 and at most ${dial.max}. The last valid profile is still active.`
        }
      >
        <Input
          type="number"
          min={0}
          max={dial.max}
          step="any"
          value={draft}
          onChange={event => {
            setDraft(event.target.value)
            const number = Number(event.target.value)
            if (
              event.target.value.trim() &&
              Number.isFinite(number) &&
              number > 0 &&
              number <= dial.max
            )
              onChange(number)
          }}
        />
      </Field>
      <label
        htmlFor={id}
        className="motion-range"
      >
        {dial.label} dial
        <input
          id={id}
          type="range"
          min={0}
          max={1000}
          step={1}
          value={toPosition(value)}
          aria-valuetext={String(value)}
          onChange={event => {
            const number = Number(
              (minimum * (dial.max / minimum) ** (Number(event.target.value) / 1000)).toPrecision(4)
            )
            setDraft(String(number))
            onChange(number)
          }}
        />
      </label>
    </div>
  )
}
export function MotionEditor({
  document,
  onChange
}: {
  document: object
  onChange: (document: object) => void
}) {
  const [scope, setScope] = useState<MotionScope>('shared')
  const input = authoredMotion(document)
  const resolved = defineMotionProfile(input)
  const parameters = scope === 'shared' ? resolved.spring : resolved.interactions[scope]
  const override = scope === 'shared' ? input.spring : input.interactions?.[scope]
  const ratio = parameters.damping / (2 * Math.sqrt(parameters.stiffness * parameters.mass))
  return (
    <div
      className="motion-editor"
      data-motion-mode={resolved.mode}
    >
      <div className="motion-toolbar">
        <label>
          Starting point
          <select
            value={matchingMotionPreset(document)}
            onChange={event => onChange(chooseMotionPreset(document, event.target.value))}
          >
            <option
              value="custom"
              disabled
            >
              Custom profile
            </option>
            {motionPresets.map(preset => (
              <option
                key={preset.id}
                value={preset.id}
              >
                {preset.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Theme motion
          <select
            value={resolved.mode}
            onChange={event =>
              onChange(
                applyMotion(document, {
                  ...input,
                  mode: event.target.value === 'off' ? 'off' : 'system'
                })
              )
            }
          >
            <option value="system">Follow system preference</option>
            <option value="off">Motion off</option>
          </select>
        </label>
        <label>
          Profile scope
          <select
            value={scope}
            onChange={event => {
              const next = motionScopes.find(item => item.id === event.target.value)
              if (next) setScope(next.id)
            }}
          >
            {motionScopes.map(item => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="motion-guidance">
        {scope === 'shared'
          ? 'Common physics supplies every interaction unless you give it an override.'
          : override && Object.keys(override).length
            ? 'This interaction has deliberate overrides. Omitted values still inherit common physics.'
            : 'This interaction inherits common physics. Change a dial to give it an override.'}
      </p>
      <div className="motion-dials">
        {motionDials.map(dial => (
          <PhysicsDial
            key={`${scope}:${dial.key}`}
            dial={dial}
            value={parameters[dial.key]}
            onChange={number =>
              onChange(
                changeMotion(document, scope, { [dial.key]: number } as Partial<SpringParameters>)
              )
            }
          />
        ))}
      </div>
      <div className="motion-physics-summary">
        <span>
          <strong>
            {ratio < 0.98 ? 'Overshooting' : ratio <= 1.02 ? 'Near critical damping' : 'Overdamped'}
          </strong>{' '}
          · damping ratio {ratio.toFixed(2)}
        </span>
        <Button
          variant="outline"
          disabled={!override || !Object.keys(override).length}
          onClick={() => onChange(inheritMotion(document, scope))}
        >
          {scope === 'shared' ? 'Use default physics' : 'Use common physics'}
        </Button>
      </div>
      <p className="motion-guidance">
        Try a new destination before motion settles. Running springs keep their momentum; edited
        physics takes effect at rest. A starting point replaces physics and interaction overrides.
        Other theme sections stay as you authored them.
      </p>
    </div>
  )
}
