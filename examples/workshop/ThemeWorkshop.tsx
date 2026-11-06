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
  useSyncExternalStore,
  type Reducer
} from 'react'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  Fieldset,
  NativeSelect,
  ThemeScope,
  generateTypography,
  type ButtonRenderProps
} from '@cognitap/radiant'
import { themes } from '@cognitap/radiant/examples'
import { useHydrated } from '../profile/useHydrated'
import { documentAPI, editors, type Editor, type SectionPatch } from './workshop-theme'
import {
  resetEditor,
  snapshotConfiguration,
  snapshotFromConfiguration,
  themeChanges,
  viewTheme,
  type ThemeSnapshot
} from './workshop-snapshot'
import {
  defaultStart,
  readSharedTheme,
  startSnapshot,
  startingThemes,
  type Start,
  type StartingPoint
} from './workshop-start'
import { decodeShare, sharePayload } from './workshop-share'
import { NewThemeDialog } from './NewTheme'
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
import { ShareButton } from './ShareButton'
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
    <Field label={label}>
      <NativeSelect
        controlSize="small"
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
      </NativeSelect>
    </Field>
  )
}

const themeHistory: Reducer<History<ThemeSnapshot>, HistoryAction<ThemeSnapshot>> = historyReducer

/** A swatch shows the theme's own button, drawn as plain markup so the swatch stays one control. */
function Tile({ className, style, children, ...props }: ButtonRenderProps) {
  return (
    <span
      className={className}
      style={style}
      data-slot={props['data-slot']}
      data-variant={props['data-variant']}
      data-tone={props['data-tone']}
      data-control-size={props['data-control-size']}
    >
      {children}
    </span>
  )
}

/** Native text editing keeps its own undo; the workshop shortcut yields to it. */
function editsText(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target instanceof HTMLTextAreaElement) return true
  return (
    target instanceof HTMLInputElement &&
    !['range', 'checkbox', 'radio', 'color', 'file', 'button', 'submit'].includes(target.type)
  )
}

/** The theme, the preview and the session have separate owners; theme edits never remount scenes.
    The baseline is fixed for the shell's lifetime: changed markers count from it and history
    opens with it as the present. */
function WorkshopShell({
  start,
  baseline,
  notice,
  focusOnEnter,
  onStart
}: {
  start: Start
  baseline: ThemeSnapshot
  /** A message about how this session opened, such as a share link in the URL that did not open. */
  notice: string | null
  focusOnEnter: boolean
  onStart: (next: StartingPoint) => void
}) {
  const [history, dispatchHistory] = useReducer(themeHistory, baseline, createHistory)
  const [pending, setPending] = useState<(StartingPoint & { label: string }) | null>(null)
  const [starting, setStarting] = useState(false)
  const editorHeading = useRef<HTMLHeadingElement>(null)
  const handoffHeading = useRef<HTMLHeadingElement>(null)
  const editorNav = useRef<HTMLElement>(null)
  const workshopHost = useRef<HTMLDivElement>(null)
  /** A swatch switch keeps focus on the strip; the dialog's starts land on the editor. */
  useEffect(() => {
    if (!focusOnEnter) return
    const swatch =
      start.kind === 'example'
        ? workshopHost.current?.querySelector<HTMLElement>('.workshop-starts [aria-pressed="true"]')
        : null
    ;(swatch ?? editorHeading.current)?.focus()
  }, [focusOnEnter, start])
  /* The nav wraps differently with each platform's system font, so scroll padding reads its
     real height instead of assuming one. */
  useEffect(() => {
    const nav = editorNav.current
    if (!nav) return
    const root = globalThis.document.documentElement
    const observer = new ResizeObserver(() =>
      root.style.setProperty('--workshop-nav', `${nav.offsetHeight}px`)
    )
    observer.observe(nav)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--workshop-nav')
    }
  }, [])
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
  /** Undoing back to the start leaves the baseline object itself as the present. */
  const unsaved = canUndo || present !== baseline
  const changeCount = editors.reduce((sum, item) => sum + changes[item.id].count, 0)
  const warning = unsaved
    ? `${changeCount === 1 ? 'One change' : `${changeCount} changes`} and the undo history of this theme will be lost. Copy a share link or download the configuration first to keep them.`
    : null
  function choose(next: StartingPoint & { label: string }) {
    if (unsaved) setPending(next)
    else onStart(next)
  }
  /** The export section sits below the editors; the shell brings it into view and hands it focus. */
  function useTheme() {
    handoffHeading.current?.scrollIntoView({ block: 'start' })
    handoffHeading.current?.focus({ preventScroll: true })
  }
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
        const next = handoffAPI.apply(snapshotConfiguration(previous), data, applyMode)
        const affected =
          data.kind === 'radiant-workshop'
            ? ['color', 'surface', 'control', 'spacing']
            : Object.keys(data.sections)
        commit(
          { label: data.kind === 'radiant-workshop' ? 'configuration import' : 'section import' },
          snapshotFromConfiguration(next)
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
      <nav
        className="workshop-starts"
        aria-label="Starting point"
      >
        {startingThemes.map((theme, index) => (
          <button
            key={theme.id}
            type="button"
            className="workshop-start"
            disabled={!ready}
            aria-label={theme.name}
            aria-pressed={start.kind === 'example' && start.id === theme.id}
            title={theme.character}
            onClick={() => {
              const next = { kind: 'example', id: theme.id } as const
              choose({
                start: next,
                baseline: startSnapshot(next),
                label: `Start from ${theme.name}`
              })
            }}
          >
            <ThemeScope
              theme={themes[index]}
              mode="system"
              className="workshop-start-tile"
            >
              <Button
                controlSize="small"
                render={props => <Tile {...props} />}
              >
                {theme.name}
              </Button>
            </ThemeScope>
          </button>
        ))}
      </nav>
      <div className="workshop-columns">
        <nav
          ref={editorNav}
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
              title="Undo"
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
              title="Redo"
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
            <Button
              variant="outline"
              title="New theme"
              disabled={!ready}
              onClick={() => setStarting(true)}
            >
              <svg
                className="workshop-history-icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 12v6M9 15h6" />
              </svg>
              <span className="workshop-history-label">New theme</span>
            </Button>
            <NewThemeDialog
              open={starting}
              warning={warning}
              onOpenChange={setStarting}
              onStart={onStart}
            />
            <Dialog
              open={pending !== null}
              onOpenChange={open => {
                if (!open) setPending(null)
              }}
            >
              <DialogContent className="workshop-confirm">
                <DialogTitle>Start a new theme?</DialogTitle>
                <DialogDescription>{warning}</DialogDescription>
                <div className="workshop-confirm-actions">
                  <DialogClose variant="outline">Keep editing</DialogClose>
                  <Button
                    onClick={() => {
                      if (!pending) return
                      setPending(null)
                      onStart(pending)
                    }}
                  >
                    {pending?.label}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="workshop-handoff-actions">
            <ShareButton
              document={document}
              recipes={recipes}
              disabled={!ready}
            />
            <Button
              className="workshop-use"
              disabled={!ready}
              onClick={useTheme}
            >
              Use this theme
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
              <h3
                ref={editorHeading}
                tabIndex={-1}
              >
                {current.label}
              </h3>
              <Button
                variant="outline"
                disabled={!ready}
                onClick={resetCurrent}
              >
                Reset {current.label.toLowerCase()}
              </Button>
            </div>
            <Fieldset
              legend={`${current.label} options`}
              parts={{ label: { className: 'workshop-sr-only' } }}
              disabled={!ready}
              className="workshop-options"
            >
              <div
                hidden={editor !== 'color'}
                className="workshop-color-panel"
              >
                <ColorEditor
                  key={colorRevision}
                  session={color}
                  accent={String(theme.modes.light['--rad-color-accent'])}
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
                <Collapsible className="workshop-typeface-lab">
                  <CollapsibleTrigger>Try a font</CollapsibleTrigger>
                  <CollapsibleContent>
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
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </Fieldset>
          </section>
          <output className="workshop-feedback">{feedback}</output>
          {notice && <p className="workshop-notice">{notice}</p>}
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
        headingRef={handoffHeading}
        onImport={importConfiguration}
        onError={importError}
      />
    </div>
  )
}

type Session = StartingPoint & { entry: number; notice: string | null; focus: boolean }

const opening: Session = {
  start: defaultStart,
  baseline: startSnapshot(defaultStart),
  entry: 0,
  notice: null,
  focus: false
}
const noSubscription = () => () => {}
const linkInUrl = () => sharePayload(window.location.hash) !== null
const noLinkOnServer = () => false

/** The Radiant example is the server render. A share link in the URL fragment opens its theme
    as the baseline instead; while it decodes, a placeholder shows, so the editor never appears
    and then gives way. Each entry remounts the shell, which starts history over. */
export function ThemeWorkshop() {
  const [session, setSession] = useState(opening)
  const [linkPending, setLinkPending] = useState(true)
  const hasLink = useSyncExternalStore(noSubscription, linkInUrl, noLinkOnServer)
  const enter = useCallback(
    (next: StartingPoint, focus = true) =>
      setSession(previous => ({ ...next, entry: previous.entry + 1, notice: null, focus })),
    []
  )
  useEffect(() => {
    let active = true
    const open = async () => {
      const payload = sharePayload(window.location.hash)
      if (payload === null) {
        setLinkPending(false)
        return
      }
      try {
        const baseline = readSharedTheme(await decodeShare(payload))
        if (active) enter({ start: { kind: 'shared', source: 'Link in the URL' }, baseline }, false)
      } catch (error) {
        if (active)
          setSession(previous => ({ ...previous, notice: `Share link: ${errorMessage(error)}` }))
      } finally {
        if (active) setLinkPending(false)
      }
    }
    void open()
    return () => {
      active = false
    }
  }, [enter])
  if (hasLink && linkPending)
    return <output className="workshop-opening">Opening the shared theme…</output>
  return (
    <WorkshopShell
      key={session.entry}
      start={session.start}
      baseline={session.baseline}
      notice={session.notice}
      focusOnEnter={session.focus}
      onStart={enter}
    />
  )
}
