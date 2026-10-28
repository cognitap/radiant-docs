'use client'

import { useRef, useState, type Dispatch } from 'react'
import { Button, type Theme, type ThemeMode } from '@cognitap/radiant'
import type { Editor } from './workshop-theme'
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
import { TextInspection } from './TypographyTools'
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

/** The one preview: a toolbar over one or two frames of the same scene. */
export function Preview({
  editor,
  theme,
  document,
  preview,
  dispatch,
  ready,
  role,
  onRole
}: {
  editor: Editor
  theme: Theme
  document: object
  preview: PreviewModel
  dispatch: Dispatch<PreviewAction>
  ready: boolean
  role: string
  onRole: (role: string) => void
}) {
  const { view, session } = preview
  const [feedback, setFeedback] = useState('')
  const primaryReplay = useRef<(() => void) | null>(null)
  const secondaryReplay = useRef<(() => void) | null>(null)
  const replays = { primary: primaryReplay, secondary: secondaryReplay }
  const Tools = previewTools[editor]
  const { scene } = view
  const key = sceneKey(scene)
  const revision = session.revisions[key] ?? 0
  const shown = frames(view)
  return (
    <section
      className="workshop-preview"
      aria-label="Theme preview"
    >
      <fieldset
        className="preview-toolbar"
        disabled={!ready}
      >
        <legend>Preview</legend>
        <div className="preview-choices">
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
        </div>
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
        <output className="preview-feedback">{feedback}</output>
      </fieldset>
      <div className="preview-body">
        <TextInspection
          enabled={view.probes.inspectText}
          role={role}
          onRole={onRole}
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
        </TextInspection>
      </div>
    </section>
  )
}
