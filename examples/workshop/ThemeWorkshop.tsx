'use client'

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Reducer
} from 'react'
import { Button, generateTypography } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import { documentAPI, editors, type Editor, type SectionPatch } from './workshop-theme'
import {
  initialSnapshot,
  resetEditor,
  themeChanges,
  viewTheme,
  type ThemeSnapshot
} from './workshop-snapshot'
import {
  createHistory,
  historyReducer,
  type Change,
  type History,
  type HistoryAction
} from './workshop-history'
import { initialPreview, previewReducer } from './workshop-preview'
import { Preview } from './Preview'
import { focusControl } from './ControlChange'
import type { ControlTarget } from './workshop-inspect'
import { ThemeHandoff, type ImportResult } from './ThemeHandoff'
import { handoffAPI, errorMessage, type ImportData } from './workshop-handoff'
import { GeometryEditor } from './GeometryEditor'
import { geometryAPI, type GeometryRecipe } from './workshop-geometry'
import { ColorEditor } from './ColorEditor'
import { FontEditor } from './FontEditor'
import { TypographyEditor } from './TypographyEditor'
import { WorkshopFontLoader } from './font-runtime'
import type { HandleEdit } from './TextHandles'
import type { TrialFont } from './workshop-fonts'
import { applyTypesetting, chooseAssignment, documentTypesetting } from './workshop-typography'
import { MotionEditor } from './MotionEditor'
import { colorAPI, type ColorRecipe } from './workshop-color'
import './workshop.css'

function Choice({
  label,
  value,
  choices,
  onChange
}: {
  label: string
  value: string
  choices: readonly (readonly [string, string])[]
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        {!choices.some(([id]) => id === value) && <option value={value}>Custom · {value}</option>}
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

const descriptions: Record<Editor, string> = {
  color: 'Build a complete color system and inspect its roles in the preview.',
  typography: 'Pick faces here, then drag the selected text in the preview or scrub a value.',
  geometry: 'Shape shared spacing, control sizes and surfaces across the same scenes.',
  motion: 'Tune a physical response, then feel it in real interactions.'
}
const themeHistory: Reducer<History<ThemeSnapshot>, HistoryAction<ThemeSnapshot>> = historyReducer

/** Native text editing keeps its own undo; the workshop shortcut yields to it. */
function editsText(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true
  return (
    target instanceof HTMLInputElement &&
    !['range', 'checkbox', 'radio', 'color', 'file', 'button', 'submit'].includes(target.type)
  )
}

/** The theme, the preview and the session have separate owners; theme edits never remount scenes. */
export function ThemeWorkshop() {
  const [baseline] = useState(initialSnapshot)
  const [history, dispatchHistory] = useReducer(themeHistory, baseline, createHistory)
  const present = history.present.state
  const presentRef = useRef(present)
  useEffect(() => {
    presentRef.current = present
  }, [present])
  const { document, geometry } = present
  const [preview, dispatch] = useReducer(previewReducer, undefined, initialPreview)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [colorRevision, setColorRevision] = useState(0)
  const [geometryRevision, setGeometryRevision] = useState(0)
  const [fontRevision, setFontRevision] = useState(0)
  const [fontLoader, setFontLoader] = useState<WorkshopFontLoader | null>(null)
  const [localFont, setLocalFont] = useState<TrialFont | null>(null)
  const [selectedRole, setSelectedRole] = useState('prose-body')
  const [editor, setEditor] = useState<Editor>('color')
  const [jump, setJump] = useState<ControlTarget | null>(null)
  const [feedback, setFeedback] = useState('')
  const ready = useHydrated()
  const panelId = useId()
  const countId = useId()
  const workshopHost = useRef<HTMLDivElement>(null)
  const view = useMemo(() => viewTheme(present), [present])
  const baselineView = useMemo(() => viewTheme(baseline), [baseline])
  const changes = useMemo(() => themeChanges(view, baselineView), [view, baselineView])
  const { theme, color } = view
  const recipes = useMemo(
    () => ({ color: color?.recipe, geometry: geometry ?? undefined }),
    [color, geometry]
  )
  const commit = useCallback(
    (change: Change, state: ThemeSnapshot | ((state: ThemeSnapshot) => ThemeSnapshot)) =>
      dispatchHistory({ type: 'commit', state, change, at: Date.now() }),
    []
  )
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0
  const undo = useCallback(() => {
    if (!history.past.length) return
    dispatchHistory({ type: 'undo' })
    setFeedback(`Undid ${history.present.label}.`)
  }, [history])
  const redo = useCallback(() => {
    const next = history.future[0]
    if (!next) return
    dispatchHistory({ type: 'redo' })
    setFeedback(`Redid ${next.label}.`)
  }, [history])
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || editsText(event.target)) return
      const key = event.key.toLowerCase()
      if (key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === 'y' && event.ctrlKey && !event.shiftKey) {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [undo, redo])
  const importConfiguration = useCallback(
    (data: ImportData, applyMode: 'merge' | 'replace') => {
      const previous = presentRef.current
      try {
        const current = handoffAPI.configuration(previous.document, {
          color: previous.color ?? undefined,
          geometry: previous.geometry ?? undefined
        })
        const next = handoffAPI.apply(current, data, applyMode)
        const affected =
          data.kind === 'radiant-workshop'
            ? ['color', 'surface', 'control', 'spacing']
            : Object.keys(data.sections)
        commit(
          { label: data.kind === 'radiant-workshop' ? 'configuration import' : 'section import' },
          {
            document: next.document,
            color: next.recipes.color ?? null,
            geometry: next.recipes.geometry ?? null
          }
        )
        if (affected.some(name => ['color', 'surface'].includes(name)))
          setColorRevision(value => value + 1)
        if (affected.some(name => ['control', 'spacing', 'surface'].includes(name)))
          setGeometryRevision(value => value + 1)
        setImportResult({
          ok: true,
          message:
            data.kind === 'radiant-workshop'
              ? 'Configuration restored. Preview controls and scene interactions retained.'
              : `Sections ${applyMode === 'merge' ? 'merged' : 'replaced'}. Unrelated sections and scene interactions retained.`
        })
      } catch (error) {
        setImportResult({
          ok: false,
          message: `Import: ${errorMessage(error)} Current theme retained.`
        })
      }
    },
    [commit]
  )
  const importError = useCallback((message: string) => setImportResult({ ok: false, message }), [])
  const values = theme.modes.light
  const current = editors.find(item => item.id === editor)!
  const token = (name: `--rad-${string}`) => String(values[name])
  function chooseEditor(next: Editor) {
    setEditor(next)
    dispatch({ type: 'editor', editor: next })
  }
  function edit(label: string, patch: SectionPatch) {
    commit({ label }, previous => ({
      ...previous,
      document: documentAPI.update(previous.document, patch)
    }))
    setFeedback(`${current.label} updated. Preview state retained.`)
  }
  function updateColor(recipe: ColorRecipe, change: Change) {
    const session = colorAPI.create(recipe)
    commit(change, previous => ({
      ...previous,
      document: colorAPI.apply(previous.document, session),
      color: session.recipe
    }))
    setFeedback('Color updated. Other sections and preview state retained.')
  }
  function updateGeometry(recipe: GeometryRecipe, change: Change) {
    commit(change, previous => ({
      ...previous,
      document: geometryAPI.apply(previous.document, recipe),
      geometry: recipe
    }))
    setFeedback('Spacing & surfaces updated. Other sections and preview state retained.')
  }
  function updateDocument(next: object, change: Change) {
    commit(change, previous => ({ ...previous, document: next }))
  }
  function resetCurrent() {
    commit({ label: `${current.label.toLowerCase()} reset` }, previous =>
      resetEditor(previous, baseline, editor)
    )
    if (editor === 'color') setColorRevision(value => value + 1)
    if (editor === 'geometry') setGeometryRevision(value => value + 1)
    if (editor === 'typography') setFontRevision(value => value + 1)
    setFeedback(`${current.label} reset. Other sections and preview state retained.`)
  }
  function selectRole(role: string) {
    setSelectedRole(role)
    workshopHost.current
      ?.querySelector<HTMLInputElement>('.typesetting-roles input:checked')
      ?.focus({ preventScroll: true })
  }
  /** A preview handle writes typesetting input through the same path as the editor's controls. */
  function editTypography({ input, change }: HandleEdit) {
    updateDocument(applyTypesetting(document, input, localFont), change)
  }
  /** The preview names an editor field; the editors open its scope during render, then the shell focuses it. */
  function jumpTo(target: ControlTarget) {
    const role = target.field.match(/^style\.([a-z-]+)\./)?.[1]
    if (role) setSelectedRole(role)
    chooseEditor(target.editor)
    setJump({ ...target })
  }
  /** On narrow screens the editor row scrolls sideways; keep the chosen editor in it. */
  useEffect(() => {
    const tab = workshopHost.current?.querySelector<HTMLElement>(
      '.workshop-editor-tabs [aria-pressed="true"]'
    )
    const row = tab?.parentElement
    if (!tab || !row || row.scrollWidth <= row.clientWidth) return
    row.scrollLeft = tab.offsetLeft - row.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2
  }, [editor])
  useEffect(() => {
    if (!jump || !workshopHost.current) return
    const control = focusControl(workshopHost.current, jump.field)
    setFeedback(
      control
        ? `Showing ${editors.find(item => item.id === jump.editor)!.label}.`
        : `No control for ${jump.field} in ${editors.find(item => item.id === jump.editor)!.label}.`
    )
  }, [jump])
  return (
    <div
      ref={workshopHost}
      className="theme-workshop"
      data-workshop-geometry={geometry ? 'enabled' : 'imported'}
      data-workshop-color={color ? 'enabled' : 'imported'}
    >
      <div className="workshop-columns">
        <nav
          className="workshop-editor-nav"
          aria-label="Theme editors"
        >
          <div className="workshop-editor-tabs">
            {editors.map(item => {
              const count = changes[item.id].count
              return (
                <Fragment key={item.id}>
                  <Button
                    disabled={!ready}
                    variant={editor === item.id ? 'solid' : 'outline'}
                    aria-pressed={editor === item.id}
                    aria-controls={panelId}
                    aria-describedby={count ? `${countId}-${item.id}` : undefined}
                    onClick={() => chooseEditor(item.id)}
                  >
                    {item.label}
                    {count > 0 && (
                      <span
                        className="workshop-nav-count"
                        aria-hidden="true"
                      >
                        {count}
                      </span>
                    )}
                  </Button>
                  {count > 0 && (
                    <span
                      id={`${countId}-${item.id}`}
                      className="workshop-sr-only"
                    >
                      {count} changed
                    </span>
                  )}
                </Fragment>
              )
            })}
          </div>
          <div className="workshop-history">
            <Button
              variant="outline"
              disabled={!ready || !canUndo}
              onClick={undo}
            >
              <svg
                className="workshop-history-icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
              </svg>
              <span className="workshop-history-label">Undo</span>
            </Button>
            <Button
              variant="outline"
              disabled={!ready || !canRedo}
              onClick={redo}
            >
              <svg
                className="workshop-history-icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
              </svg>
              <span className="workshop-history-label">Redo</span>
            </Button>
          </div>
        </nav>
        <div className="workshop-editing">
          <section
            id={panelId}
            aria-label={`${current.label} editor`}
            className="workshop-editor"
          >
            <div className="workshop-editor-heading">
              <h3>{current.label}</h3>
              <Button
                variant="outline"
                disabled={!ready}
                onClick={resetCurrent}
              >
                Reset {current.label.toLowerCase()}
              </Button>
            </div>
            <p>{descriptions[editor]}</p>
            <fieldset
              disabled={!ready}
              className="workshop-options"
            >
              <legend>{current.label} settings</legend>
              <div
                hidden={editor !== 'color'}
                className="workshop-color-panel"
              >
                <ColorEditor
                  key={colorRevision}
                  session={color}
                  changes={changes.color.changes}
                  disabled={!ready}
                  target={jump?.editor === 'color' ? jump : undefined}
                  onChange={updateColor}
                />
              </div>
              {editor === 'typography' && !view.typography && (
                <>
                  <Choice
                    label="Body family"
                    value={token('--rad-typography-family')}
                    choices={[
                      ['system-ui, sans-serif', 'System sans'],
                      ['Georgia, serif', 'Georgia serif'],
                      ['ui-monospace, monospace', 'System mono']
                    ]}
                    onChange={family => edit('body family', { typography: { values: { family } } })}
                  />
                  <Choice
                    label="Body size"
                    value={token('--rad-typography-body-size')}
                    choices={[
                      ['0.875rem', '14px base'],
                      ['1rem', '16px base'],
                      ['1.125rem', '18px base']
                    ]}
                    onChange={bodySize =>
                      edit('body size', { typography: { values: { bodySize } } })
                    }
                  />
                </>
              )}
              <div
                hidden={editor !== 'geometry'}
                className="workshop-geometry-panel"
              >
                <GeometryEditor
                  key={geometryRevision}
                  recipe={geometry}
                  changes={changes.geometry.changes}
                  theme={theme}
                  disabled={!ready}
                  target={jump?.editor === 'geometry' ? jump : undefined}
                  onChange={updateGeometry}
                />
              </div>
              <div
                hidden={editor !== 'motion'}
                className="workshop-motion-panel"
              >
                <MotionEditor
                  document={document}
                  changes={changes.motion.changes}
                  target={jump?.editor === 'motion' ? jump : undefined}
                  onChange={updateDocument}
                  onScene={scene => dispatch({ type: 'scene', scene: { kind: 'motion', scene } })}
                />
              </div>
              <div
                hidden={editor !== 'typography'}
                className="workshop-typesetting-panel"
              >
                <TypographyEditor
                  active={editor === 'typography'}
                  document={document}
                  result={view.typography}
                  changes={changes.typography.changes}
                  loader={fontLoader}
                  local={localFont}
                  selectedRole={selectedRole}
                  onSelectRole={setSelectedRole}
                  onChange={updateDocument}
                />
              </div>
              <div
                hidden={editor !== 'typography'}
                className="workshop-font-panel"
              >
                <details className="workshop-typeface-lab">
                  <summary>Try a font</summary>
                  <FontEditor
                    key={fontRevision}
                    onSession={setFontLoader}
                    onLocalReady={setLocalFont}
                    onAssignFont={(next, font, context) =>
                      applyTypesetting(
                        next,
                        chooseAssignment(
                          documentTypesetting(next)?.input ?? generateTypography().input,
                          context,
                          font
                        ),
                        font.source === 'local' ? font : localFont
                      )
                    }
                    active={editor === 'typography'}
                    document={document}
                    onChange={next => updateDocument(next, { label: 'font assignment' })}
                  />
                </details>
              </div>
            </fieldset>
          </section>
          <output className="workshop-feedback">{feedback}</output>
          {importResult && <p className="workshop-notice">{importResult.message}</p>}
        </div>
        <Preview
          editor={editor}
          theme={theme}
          document={document}
          color={color?.recipe ?? null}
          preview={preview}
          dispatch={dispatch}
          ready={ready}
          role={selectedRole}
          typography={view.typography}
          geometry={geometry}
          onRole={selectRole}
          onJump={jumpTo}
          onTypography={editTypography}
          onGeometry={edit => updateGeometry(edit.recipe, edit.change)}
        />
      </div>
      <ThemeHandoff
        document={document}
        recipes={recipes}
        result={importResult}
        onImport={importConfiguration}
        onError={importError}
      />
    </div>
  )
}
