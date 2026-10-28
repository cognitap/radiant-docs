'use client'

import { useEffect, useId, useRef, useState, type Dispatch } from 'react'
import { Button, type Theme, type ThemeMode, type TypographyResult } from '@cognitap/radiant'
import type { Editor } from './workshop-theme'
import type { ColorRecipe } from './workshop-color'
import { authoredMotion } from './workshop-motion'
import type { ControlTarget } from './workshop-inspect'
import {
  compareChoices,
  compareId,
  fixedWidths,
  frames,
  parseCompare,
  parseScene,
  parseWidth,
  sceneGroups,
  sceneKey,
  sceneName,
  widthId,
  widthNames,
  type Preview as PreviewModel,
  type PreviewAction
} from './workshop-preview'
import { Page } from './PageScenes'
import { ComponentScene } from './ComponentScene'
import { MotionFrame } from './MotionScenes'
import { PreviewFrame } from './PreviewFrame'
import { Inspection, Inspector, type Selection } from './PreviewInspection'
import { TextHandles, type HandleEdit } from './TextHandles'
import { GeometryHandles, type GeometryEdit } from './GeometryHandles'
import type { GeometryRecipe } from './workshop-geometry'
import { previewTools } from './preview-tools'
import './preview.css'

function Choice({
  label,
  value,
  choices,
  disabled,
  onChange
}: {
  label: string
  value: string
  choices: readonly (readonly [string, string])[]
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
      >
        {choices.map(([id, name]) => (
          <option
            key={id}
            value={id}
          >
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

const modes: readonly [ThemeMode, string][] = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['system', 'System']
]
const widthChoices: readonly [string, string][] = [
  ['fill', 'Available width'],
  ...fixedWidths.map((px): [string, string] => [String(px), widthNames[px]])
]
const componentStates = ['rest', 'invalid', 'disabled', 'pending'] as const

/** The one preview: a toolbar over one or two frames of the same scene. Below the two-column
    breakpoint it is a sticky strip whose options fold behind one button and which can expand. */
export function Preview({
  editor,
  theme,
  document,
  color,
  preview,
  dispatch,
  ready,
  role,
  typography,
  geometry,
  onRole,
  onJump,
  onTypography,
  onGeometry
}: {
  editor: Editor
  theme: Theme
  document: object
  color: ColorRecipe | null
  preview: PreviewModel
  dispatch: Dispatch<PreviewAction>
  ready: boolean
  role: string
  /** The typesetting result while Typography is active; its handles draw on the selected role. */
  typography: TypographyResult | null
  onRole: (role: string) => void
  onJump: (target: ControlTarget) => void
  onTypography: (edit: HandleEdit) => void
  /** The geometry recipe while Spacing & surfaces is active; its handles sit on a control and a surface. */
  geometry: GeometryRecipe | null
  onGeometry: (edit: GeometryEdit) => void
}) {
  const { view, session } = preview
  const [feedback, setFeedback] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const inspecting = view.probes.inspect
  const setInspecting = (on: boolean) => {
    dispatch({ type: 'probe', probe: 'inspect', on })
    if (!on) setSelection(null)
  }
  const inspectMode = view.mode === 'dark' ? 'dark' : 'light'
  const primaryReplay = useRef<(() => void) | null>(null)
  const secondaryReplay = useRef<(() => void) | null>(null)
  const replays = { primary: primaryReplay, secondary: secondaryReplay }
  const Tools = previewTools[editor]
  const { scene } = view
  const key = sceneKey(scene)
  const revision = session.revisions[key] ?? 0
  const shown = frames(view)
  const [expanded, setExpanded] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const region = useRef<HTMLElement>(null)
  const optionsToggle = useRef<HTMLButtonElement>(null)
  const options = useRef<HTMLDivElement>(null)
  const optionsId = useId()
  const regionId = useId()
  useEffect(() => {
    if (!optionsOpen) return
    const close = (event: KeyboardEvent) => {
      const target = event.target instanceof Node ? event.target : null
      const inside = [optionsToggle.current, options.current].some(node => node?.contains(target))
      if (event.key !== 'Escape' || !inside) return
      setOptionsOpen(false)
      optionsToggle.current?.focus()
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [optionsOpen])
  const expand = (on: boolean) => {
    setExpanded(on)
    const top = region.current?.getBoundingClientRect().top ?? 0
    if (on && top > 0) window.scrollBy({ top })
  }
  return (
    <section
      ref={region}
      id={regionId}
      className="workshop-preview"
      aria-label="Theme preview"
      data-expanded={expanded || undefined}
      data-inspecting={inspecting || undefined}
      data-scene={scene.kind}
    >
      <fieldset
        className="preview-toolbar"
        disabled={!ready}
      >
        <legend>Preview</legend>
        <div className="preview-choices">
          <Button
            ref={optionsToggle}
            className="preview-strip-control"
            variant={optionsOpen ? 'solid' : 'outline'}
            controlSize="small"
            aria-expanded={optionsOpen}
            aria-controls={optionsId}
            disabled={!ready}
            onClick={() => setOptionsOpen(!optionsOpen)}
          >
            Preview options
          </Button>
          <div
            ref={options}
            id={optionsId}
            className="preview-options"
            data-open={optionsOpen || undefined}
          >
            <label>
              Scene
              <select
                value={key}
                disabled={!ready}
                onChange={event => {
                  const next = parseScene(event.target.value)
                  if (next) dispatch({ type: 'scene', scene: next })
                }}
              >
                {sceneGroups.map(group => (
                  <optgroup
                    key={group.label}
                    label={group.label}
                  >
                    {group.scenes.map(item => (
                      <option
                        key={sceneKey(item)}
                        value={sceneKey(item)}
                      >
                        {sceneName(item)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <Choice
              label="Preview mode"
              value={view.mode}
              choices={modes}
              disabled={!ready}
              onChange={value => {
                const mode = modes.find(([id]) => id === value)?.[0]
                if (mode) dispatch({ type: 'mode', mode })
              }}
            />
            <Choice
              label="Preview width"
              value={widthId(view.width)}
              choices={widthChoices}
              disabled={!ready}
              onChange={value => {
                const width = parseWidth(value)
                if (width) dispatch({ type: 'width', width })
              }}
            />
            <Choice
              label="Compare"
              value={compareId(view.compare)}
              choices={compareChoices(view)}
              disabled={!ready}
              onChange={value => dispatch({ type: 'compare', compare: parseCompare(value, scene) })}
            />
            {scene.kind === 'components' && (
              <Choice
                label="Component state"
                value={scene.state}
                choices={componentStates.map(state => [
                  state,
                  state[0]!.toUpperCase() + state.slice(1)
                ])}
                disabled={!ready}
                onChange={value => {
                  const state = componentStates.find(item => item === value)
                  if (state) dispatch({ type: 'component-state', state })
                }}
              />
            )}
            <Button
              variant="outline"
              disabled={!ready}
              onClick={() => {
                dispatch({ type: 'reset-scene' })
                setFeedback(`${sceneName(scene)} reset. Theme and other scenes retained.`)
              }}
            >
              Reset scene
            </Button>
            {Tools && (
              <Tools
                view={view}
                session={session}
                dispatch={dispatch}
                disabled={!ready}
                replay={() => {
                  replays.primary.current?.()
                  replays.secondary.current?.()
                }}
                role={role}
                onRole={onRole}
              />
            )}
          </div>
          <Button
            className="preview-inspect"
            variant={inspecting ? 'solid' : 'outline'}
            aria-pressed={inspecting}
            disabled={!ready}
            onClick={() => setInspecting(!inspecting)}
          >
            Inspect
          </Button>
          <Button
            className="preview-strip-control preview-expand"
            variant="outline"
            controlSize="small"
            aria-expanded={expanded}
            aria-controls={regionId}
            disabled={!ready}
            onClick={() => expand(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        {inspecting && (
          <Inspector
            selection={selection}
            context={{
              values: theme.modes[inspectMode],
              mode: inspectMode,
              color,
              motion: authoredMotion(document)
            }}
            onJump={target => {
              setExpanded(false)
              onJump(target)
            }}
          />
        )}
        <output className="preview-feedback">{feedback}</output>
      </fieldset>
      <div className="preview-body">
        <Inspection
          enabled={inspecting}
          role={role}
          selection={selection}
          onSelect={setSelection}
          onRole={onRole}
          onExit={() => setInspecting(false)}
        >
          <div
            className="preview-frames"
            data-compare={view.compare.kind === 'none' ? undefined : view.compare.kind}
          >
            {shown.map(frame =>
              scene.kind === 'motion' ? (
                <MotionFrame
                  key={frame.id}
                  document={document}
                  mode={view.mode}
                  frame={frame}
                  scene={scene.scene}
                  session={session.motion[frame.slot]}
                  revision={revision}
                  replayRef={replays[frame.slot]}
                  onUpdate={sessions => dispatch({ type: 'motion', slot: frame.slot, sessions })}
                />
              ) : (
                <PreviewFrame
                  key={frame.id}
                  theme={theme}
                  mode={view.mode}
                  width={frame.width}
                  label={frame.label}
                  spacing={view.probes.textSpacing}
                >
                  <div key={`${key}:${revision}`}>
                    {scene.kind === 'page' ? (
                      <Page
                        page={scene.page}
                        copy={session.copy}
                        sessions={session.pages}
                        onPage={(page, patch) => dispatch({ type: 'page', page, patch })}
                      />
                    ) : (
                      <ComponentScene
                        state={scene.state}
                        count={session.components.count}
                        onCount={count => dispatch({ type: 'components', patch: { count } })}
                      />
                    )}
                  </div>
                </PreviewFrame>
              )
            )}
          </div>
          {editor === 'geometry' && geometry && scene.kind !== 'motion' && (
            <GeometryHandles
              recipe={geometry}
              mode={inspectMode}
              scene={`${key}:${revision}`}
              picked={selection?.element ?? null}
              onEdit={onGeometry}
            />
          )}
          {editor === 'typography' && typography && scene.kind !== 'motion' && (
            <TextHandles
              role={role}
              result={typography}
              picked={selection?.element ?? null}
              onEdit={onTypography}
            />
          )}
        </Inspection>
      </div>
    </section>
  )
}
