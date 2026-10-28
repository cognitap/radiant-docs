'use client'

import { useState } from 'react'
import { defineMotionProfile, type SpringParameters } from '@cognitap/radiant'
import {
  applyMotion,
  authoredMotion,
  changeMotion,
  chooseMotionPreset,
  clearMotionOverride,
  inheritMotion,
  matchingMotionPreset,
  motionPresets,
  motionScopes,
  type MotionFields,
  type MotionScope
} from './workshop-motion'
import { springDials, type SpringKey } from './workshop-motion-view'
import { motionSceneFor, type MotionScene } from './workshop-preview'
import { useMovement } from './motion-trace'
import { SpringCurve } from './SpringCurve'
import { SpringSample } from './SpringSample'
import { ScrubField } from './ScrubField'
import { OptionCards } from './GeometryControls'
import { Chips } from './TypographyPickers'
import { Changed } from './ControlChange'
import type { Change } from './workshop-history'
import type { Changes } from './workshop-fields'
import type { ControlTarget } from './workshop-inspect'
import './motion-editor.css'

const inherited = (value: number | undefined) =>
  value === undefined ? 'common physics' : String(value)
const presetName = (id: string) => motionPresets.find(preset => preset.id === id)?.name ?? 'Custom'
const targetScope = (target: ControlTarget | undefined) =>
  motionScopes.find(scope => target?.field.startsWith(`${scope.id}.`))?.id
const modeOptions = [
  { value: 'system', label: 'Follow system' },
  { value: 'off', label: 'Motion off' }
]

export function MotionEditor({
  document,
  changes,
  target,
  onChange,
  onScene
}: {
  document: object
  changes: Changes<MotionFields> | null
  target?: ControlTarget
  onChange: (document: object, change: Change) => void
  /** Choosing an interaction shows the preview scene that exercises it. */
  onScene: (scene: MotionScene) => void
}) {
  const [scope, setScope] = useState<MotionScope>('shared')
  const [seen, setSeen] = useState(target)
  if (target !== seen) {
    setSeen(target)
    const next = targetScope(target)
    if (next) setScope(next)
  }
  const movement = useMovement()
  const input = authoredMotion(document)
  const resolved = defineMotionProfile(input)
  const parameters = scope === 'shared' ? resolved.spring : resolved.interactions[scope]
  const override = scope === 'shared' ? input.spring : input.interactions?.[scope]
  const overridden = (key: SpringKey) => scope !== 'shared' && override?.[key] !== undefined
  const scopeName = motionScopes.find(item => item.id === scope)!.label.toLowerCase()
  const setDial = (key: SpringKey, value: number | undefined) =>
    onChange(
      value === undefined && scope !== 'shared'
        ? clearMotionOverride(document, scope, key)
        : changeMotion(document, scope, { [key]: value } as Partial<SpringParameters>),
      { label: `${scopeName} ${key}`, coalesce: `${scope}.${key}` }
    )
  const preset = matchingMotionPreset(document)
  const cards = [
    ...motionPresets.map(item => ({
      value: item.id,
      name: item.name,
      sample: <SpringSample parameters={item.spring} />
    })),
    {
      value: 'custom',
      name: 'Custom',
      disabled: true,
      sample: <SpringSample parameters={resolved.spring} />
    }
  ]
  const scopeChips = motionScopes.map(item => {
    const overrides = item.id === 'shared' ? undefined : input.interactions?.[item.id]
    return {
      value: item.id,
      label: item.label,
      marked: overrides && Object.keys(overrides).length ? 'has its own physics' : undefined
    }
  })
  return (
    <div
      className="motion-editor"
      data-motion-mode={resolved.mode}
    >
      <div className="motion-start">
        <section className="motion-section">
          <h4>Starting point</h4>
          <Changed
            changes={changes}
            field="preset"
            label="Starting point"
            format={presetName}
            set={id =>
              onChange(chooseMotionPreset(document, id), { label: 'motion starting point' })
            }
          >
            {describedBy => (
              <OptionCards
                label="Starting point"
                options={cards}
                value={preset}
                describedBy={describedBy}
                onChange={id =>
                  onChange(chooseMotionPreset(document, id), { label: 'motion starting point' })
                }
              />
            )}
          </Changed>
        </section>
        <section className="motion-section">
          <h4>Theme motion</h4>
          <Changed
            changes={changes}
            field="mode"
            label="Theme motion"
            set={mode =>
              onChange(applyMotion(document, { ...input, mode }), { label: 'theme motion' })
            }
          >
            {describedBy => (
              <Chips
                label="Theme motion"
                options={modeOptions}
                value={resolved.mode}
                describedBy={describedBy}
                onChange={value =>
                  onChange(
                    applyMotion(document, { ...input, mode: value === 'off' ? 'off' : 'system' }),
                    { label: 'theme motion' }
                  )
                }
              />
            )}
          </Changed>
        </section>
      </div>
      <section className="motion-section">
        <div className="motion-head">
          <h4>Physics for</h4>
          <button
            type="button"
            className="motion-link"
            disabled={!override || !Object.keys(override).length}
            onClick={() =>
              onChange(inheritMotion(document, scope), {
                label: scope === 'shared' ? 'default physics' : `${scopeName} physics`
              })
            }
          >
            {scope === 'shared' ? 'Use default physics' : 'Use common physics'}
          </button>
        </div>
        <Chips
          label="Physics for"
          options={scopeChips}
          value={scope}
          onChange={value => {
            const next = motionScopes.find(item => item.id === value)
            if (!next) return
            setScope(next.id)
            if (next.id !== 'shared') onScene(motionSceneFor[next.id])
          }}
        />
      </section>
      <section className="motion-section">
        <h4>
          {scope === 'shared'
            ? 'Response'
            : `${motionScopes.find(item => item.id === scope)!.label} response`}
        </h4>
        <SpringCurve
          parameters={parameters}
          movement={movement}
          onChange={(key, value) => setDial(key, value)}
        />
        <div className="motion-dials">
          {springDials.map(dial => (
            <div
              key={`${scope}:${dial.key}`}
              className="motion-dial"
              data-overridden={overridden(dial.key) || undefined}
            >
              <Changed
                changes={changes}
                field={`${scope}.${dial.key}`}
                label={scope === 'shared' ? dial.label : `${scopeName} ${dial.label.toLowerCase()}`}
                format={inherited}
                set={value => setDial(dial.key, value)}
              >
                {describedBy => (
                  <ScrubField
                    scrub={dial}
                    value={parameters[dial.key]}
                    describedBy={describedBy}
                    onChange={value => setDial(dial.key, value)}
                  />
                )}
              </Changed>
              {overridden(dial.key) && (
                <button
                  type="button"
                  className="motion-link"
                  onClick={() => setDial(dial.key, undefined)}
                >
                  Use common
                  <span className="workshop-sr-only"> {dial.label.toLowerCase()}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
