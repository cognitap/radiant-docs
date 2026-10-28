'use client'

import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject
} from 'react'
import { Button } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import {
  errorMessage,
  handoffAPI,
  jsonText,
  maxConfigurationBytes,
  sectionNames,
  type ImportData,
  type Recipes,
  type SectionName
} from './workshop-handoff'
import { setupGuide, setups, type Setup, type SetupGuide, type SetupStep } from './workshop-setup'
import { fontFamilies, fontPlacement } from './font-requirements'
import { downloadText } from './workshop-download'
import './theme-handoff.css'

export interface ImportResult {
  ok: boolean
  message: string
}
const setupKey = 'radiant-workshop-setup'
const isSetup = (value: unknown): value is Setup => setups.some(setup => setup.id === value)
function rememberedSetup(): Setup | null {
  try {
    const value = window.localStorage.getItem(setupKey)
    return isSetup(value) ? value : null
  } catch {
    return null
  }
}
function rememberSetup(setup: Setup) {
  try {
    window.localStorage.setItem(setupKey, setup)
  } catch {
    /* A blocked store only loses the convenience. */
  }
}
const lines = (text: string) => text.split('\n').length
const lowerFirst = (text: string) => text[0].toLowerCase() + text.slice(1)

/** A read-only code field that opens at a few lines and expands to its full text. */
function CodeField({
  label,
  text,
  collapsedRows,
  expandable = true
}: {
  label: string
  text: string
  collapsedRows: number
  expandable?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const total = lines(text)
  const rows = expanded ? total : Math.min(total, collapsedRows)
  return (
    <div className="handoff-code">
      <label>
        {label}
        <textarea
          readOnly
          rows={rows}
          wrap="off"
          value={text}
        />
      </label>
      {expandable && total > collapsedRows && (
        <button
          type="button"
          className="handoff-expand"
          aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
        >
          {expanded ? 'Collapse' : `Expand · ${total} lines`}
        </button>
      )}
    </div>
  )
}

export function ThemeHandoff({
  document: themeDocument,
  recipes,
  result,
  headingRef,
  onImport,
  onError
}: {
  document: object
  recipes: Recipes
  result: ImportResult | null
  headingRef: RefObject<HTMLHeadingElement | null>
  onImport: (data: ImportData, mode: 'merge' | 'replace') => void
  onError: (message: string) => void
}) {
  const resultId = useId()
  const ready = useHydrated()
  const [setup, setSetup] = useState<Setup>('react')
  const [selected, setSelected] = useState<SectionName[]>([
    'color',
    'surface',
    'control',
    'spacing'
  ])
  const [applyMode, setApplyMode] = useState<'merge' | 'replace'>('merge')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState('')
  const operation = useRef({ ticket: 0 })
  useEffect(() => {
    const remembered = rememberedSetup()
    if (remembered) setSetup(remembered)
  }, [])
  function chooseSetup(next: Setup) {
    setSetup(next)
    rememberSetup(next)
  }
  /* Preparing the exports re-parses the whole document (about 25 ms), so it follows a drag
     at low priority instead of running inside every input event. */
  const deferredDocument = useDeferredValue(themeDocument)
  const deferredRecipes = useDeferredValue(recipes)
  const deferredSetup = useDeferredValue(setup)
  const prepared = useMemo(() => {
    try {
      const config = handoffAPI.configuration(deferredDocument, deferredRecipes)
      const guide = setupGuide(deferredSetup, config.document)
      const other =
        deferredSetup === 'react'
          ? setupGuide('css', config.document)
          : setupGuide('react', config.document)
      let typographyCSS = '',
        typographyCSSError = ''
      try {
        typographyCSS = handoffAPI.cssOutput(config.document, ['typography'])
      } catch (error) {
        typographyCSSError = errorMessage(error)
      }
      return {
        config,
        guide,
        other,
        typographyTyped: handoffAPI.typedTheme(config.document, ['typography']),
        typographyCSS,
        typographyCSSError,
        motionTyped: handoffAPI.typedTheme(config.document, ['motion']),
        error: ''
      }
    } catch (error) {
      return {
        config: null,
        guide: null as SetupGuide | null,
        other: null as SetupGuide | null,
        typographyTyped: '',
        typographyCSS: '',
        typographyCSSError: '',
        motionTyped: '',
        error: errorMessage(error)
      }
    }
  }, [deferredDocument, deferredRecipes, deferredSetup])
  const sections = prepared.config
    ? jsonText(handoffAPI.sections(prepared.config.document, selected))
    : ''
  const configText = prepared.config ? jsonText(prepared.config) : ''
  function importText(text: string) {
    operation.current.ticket++
    try {
      onImport(handoffAPI.read(text), applyMode)
      setFeedback('')
    } catch (error) {
      onError(`Import: ${errorMessage(error)} Current theme retained.`)
    }
  }
  async function importFile(file: File) {
    const ticket = ++operation.current.ticket
    try {
      if (file.size > maxConfigurationBytes)
        throw new Error('Configuration exceeds 256 KiB. Use a smaller JSON file.')
      const text = await file.text()
      if (ticket === operation.current.ticket) importText(text)
    } catch (error) {
      if (ticket === operation.current.ticket)
        onError(`Import: ${errorMessage(error)} Current theme retained.`)
    }
  }
  async function copy(text: string, label: string) {
    if (busy) return
    setBusy(label)
    try {
      await navigator.clipboard.writeText(text)
      setFeedback(`${label} copied.`)
    } catch {
      setFeedback(`Copy failed. Select and copy the ${label.toLowerCase()} field below.`)
    } finally {
      setBusy('')
    }
  }
  function download(text: string, name: string, type: string) {
    try {
      downloadText(text, name, type)
      setFeedback(`${name} downloaded.`)
    } catch (error) {
      setFeedback(`Download failed: ${errorMessage(error)} Copy the field below instead.`)
    }
  }
  const unavailable = !ready || !prepared.config
  const guide = prepared.guide
  const families = guide ? fontFamilies(guide.fonts) : []
  const other = prepared.other
  const outputField = (item: SetupGuide) => `${item.output.label} output`
  /** Copy and download for one text, named after it. */
  const actions = (label: string, text: string, name: string, type: string) => (
    <div className="workshop-actions">
      <Button
        variant="outline"
        aria-disabled={!!busy}
        onClick={() => void copy(text, label)}
      >
        Copy {lowerFirst(label)}
      </Button>
      <Button
        variant="outline"
        onClick={() => download(text, name, type)}
      >
        Download {lowerFirst(label)}
      </Button>
    </div>
  )
  const format = (name: string, children: ReactNode) => (
    <details className="handoff-format">
      <summary>{name}</summary>
      {children}
    </details>
  )
  function stepBody(step: SetupStep) {
    if (!step.label || step.code === undefined) return null
    const label = step.label
    return (
      <div className="handoff-step-code">
        <CodeField
          label={label}
          text={step.code}
          collapsedRows={8}
        />
        <Button
          variant="outline"
          aria-disabled={!!busy}
          onClick={() => void copy(step.code!, label)}
        >
          Copy {lowerFirst(label)}
        </Button>
      </div>
    )
  }
  return (
    <section
      className="theme-handoff"
      data-settling={deferredDocument !== themeDocument || deferredSetup !== setup || undefined}
      aria-label="Theme handoff"
    >
      <h3
        ref={headingRef}
        tabIndex={-1}
      >
        Use your theme
      </h3>
      {prepared.error && <p>{prepared.error}</p>}
      <output className="handoff-feedback">{feedback}</output>
      <output
        id={resultId}
        className={result?.ok === false ? 'handoff-import-error' : 'handoff-import-result'}
      >
        {result?.message ?? ''}
      </output>
      <fieldset
        className="handoff-setups"
        disabled={unavailable}
      >
        <legend>How do you use Radiant?</legend>
        {setups.map(choice => (
          <label
            key={choice.id}
            className="handoff-setup"
          >
            <input
              type="radio"
              name="handoff-setup"
              value={choice.id}
              checked={setup === choice.id}
              aria-labelledby={`${resultId}-${choice.id}`}
              aria-describedby={`${resultId}-${choice.id}-hint`}
              onChange={() => chooseSetup(choice.id)}
            />
            <span
              id={`${resultId}-${choice.id}`}
              className="handoff-setup-label"
            >
              {choice.label}
            </span>
            <span
              id={`${resultId}-${choice.id}-hint`}
              className="handoff-setup-hint"
            >
              {choice.hint}
            </span>
          </label>
        ))}
      </fieldset>
      {guide && (
        <fieldset
          className="handoff-output"
          disabled={unavailable}
        >
          <legend>
            {guide.output.label} · <code>{guide.output.name}</code>
          </legend>
          {guide.error ? (
            <p>{guide.error}</p>
          ) : (
            <>
              <div className="workshop-actions">
                <Button
                  aria-disabled={!!busy}
                  aria-label={`Copy ${lowerFirst(guide.output.label)}`}
                  pending={busy === guide.output.label}
                  onClick={() => void copy(guide.output.text, guide.output.label)}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  aria-label={`Download ${lowerFirst(guide.output.label)}`}
                  onClick={() => download(guide.output.text, guide.output.name, guide.output.type)}
                >
                  Download
                </Button>
              </div>
              <CodeField
                label={outputField(guide)}
                text={guide.output.text}
                collapsedRows={14}
              />
            </>
          )}
          <ol className="handoff-steps">
            {guide.steps.map((step, index) => (
              <li
                key={index}
                className={step.fonts ? 'handoff-fonts' : undefined}
              >
                <p>{step.text}</p>
                {step.fonts && (
                  <>
                    {families.some(font => font.files.length > 0) && <div>{fontPlacement}</div>}
                    <ul>
                      {families.map(font => (
                        <li key={`${font.source}/${font.family}`}>
                          <strong>{font.family}</strong>
                          {font.source !== 'catalog' && ` · ${font.source}`} ·{' '}
                          {font.weights.join(', ') || 'unspecified'} ·{' '}
                          {font.styles.join(', ') || 'unspecified'}
                          {font.note && <> · {font.note}</>}
                          {font.files.map(file => (
                            <span key={file.url}>
                              {' · '}
                              <a
                                href={file.url}
                                download
                              >
                                {file.style} WOFF2
                              </a>
                            </span>
                          ))}
                          {font.license && (
                            <>
                              {' · '}
                              <a
                                href={font.license}
                                download
                              >
                                Font license
                              </a>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {stepBody(step)}
              </li>
            ))}
          </ol>
        </fieldset>
      )}
      <details className="handoff-more">
        <summary>Other formats</summary>
        <fieldset disabled={unavailable}>
          {format(
            'Configuration file',
            <>
              <p>
                The whole workshop state: theme document, palette and font metadata, editor recipes.
              </p>
              {actions('Configuration', configText, 'radiant-workshop.json', 'application/json')}
              <CodeField
                label="Configuration output"
                text={configText}
                collapsedRows={12}
              />
            </>
          )}
          {format(
            'Selective sections',
            <>
              <p>
                Whole public sections. Color needs Surface for its canvas; Surface includes
                geometry.
              </p>
              <div className="handoff-sections">
                {sectionNames.map(name => (
                  <label key={name}>
                    <input
                      type="checkbox"
                      checked={selected.includes(name)}
                      onChange={event =>
                        setSelected(previous =>
                          event.target.checked
                            ? [...previous, name]
                            : previous.filter(value => value !== name)
                        )
                      }
                    />
                    {name}
                  </label>
                ))}
              </div>
              {actions('Sections', sections, 'radiant-sections.json', 'application/json')}
              <CodeField
                label="Section output"
                text={sections}
                collapsedRows={12}
              />
            </>
          )}
          {format(
            'Motion only',
            <>
              <p>
                Save as <code>radiant-motion.ts</code>; <code>applyMotion(target)</code> returns a
                document to compile for ThemeScope.
              </p>
              {actions(
                'Motion TypeScript',
                prepared.motionTyped,
                'radiant-motion.ts',
                'text/typescript'
              )}
              <CodeField
                label="Motion TypeScript output"
                text={prepared.motionTyped}
                collapsedRows={12}
              />
            </>
          )}
          {format(
            'Typography only',
            <>
              <p>
                <code>applyTypography(target)</code> keeps every other section. The CSS scopes to{' '}
                <code>radiant-typography</code> with the same mode attribute.
              </p>
              {actions(
                'Typography TypeScript',
                prepared.typographyTyped,
                'radiant-typography.ts',
                'text/typescript'
              )}
              <CodeField
                label="Typography TypeScript output"
                text={prepared.typographyTyped}
                collapsedRows={12}
              />
              {prepared.typographyCSSError ? (
                <p>{prepared.typographyCSSError}</p>
              ) : (
                <>
                  {actions(
                    'Typography CSS',
                    prepared.typographyCSS,
                    'radiant-typography.css',
                    'text/css'
                  )}
                  <CodeField
                    label="Typography CSS output"
                    text={prepared.typographyCSS}
                    collapsedRows={12}
                  />
                </>
              )}
            </>
          )}
          {other &&
            format(
              other.setup === 'react' ? 'Typed theme' : 'Scoped CSS',
              other.error ? (
                <p>{other.error}</p>
              ) : (
                <>
                  {actions(
                    other.output.label,
                    other.output.text,
                    other.output.name,
                    other.output.type
                  )}
                  <CodeField
                    label={outputField(other)}
                    text={other.output.text}
                    collapsedRows={12}
                  />
                </>
              )
            )}
          {format(
            'Import',
            <>
              <p>
                A configuration or full theme replaces the current theme. A section file applies the
                mode below and keeps the rest.
              </p>
              <label>
                Section apply mode
                <select
                  value={applyMode}
                  onChange={event =>
                    setApplyMode(event.target.value === 'replace' ? 'replace' : 'merge')
                  }
                >
                  <option value="merge">Merge supplied leaves</option>
                  <option value="replace">Replace supplied sections</option>
                </select>
              </label>
              <label>
                Import configuration file
                <input
                  type="file"
                  aria-describedby={resultId}
                  accept="application/json,.json"
                  onChange={event => {
                    const file = event.target.files?.[0]
                    event.target.value = ''
                    if (file) void importFile(file)
                  }}
                />
              </label>
              <label>
                Configuration JSON
                <textarea
                  rows={8}
                  aria-describedby={resultId}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                />
              </label>
              <Button onClick={() => importText(input)}>Import JSON</Button>
            </>
          )}
        </fieldset>
      </details>
    </section>
  )
}
