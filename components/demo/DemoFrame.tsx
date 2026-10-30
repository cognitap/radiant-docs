'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode
} from 'react'
import { Button, ThemeScope, type Theme, type ThemeMode } from '@cognitap/radiant'
import { radiant, themes } from '@cognitap/radiant/examples'
import { useHydrated } from '@/examples/profile/useHydrated'
import { SelectControl } from './ActionControls'

/** `html` is the highlighted `code`, rendered on the server. */
export type DemoSource = { name: string; code: string; html: string }

/**
 * An example with its own history opts out of the frame's remount reset. `sources` is either
 * the highlighted listing or the URL of a static `DemoSource[]` file, fetched the first
 * time the listing opens.
 */
export function DemoFrame({
  title,
  sources,
  reset = true,
  children
}: {
  title: string
  sources: readonly DemoSource[] | string
  reset?: boolean
  children: ReactNode
}) {
  const titleId = useId()
  const [revision, setRevision] = useState(0)
  const ready = useHydrated()

  return (
    <section
      className="demo-frame"
      aria-labelledby={titleId}
    >
      <div className="demo-heading">
        <h2 id={titleId}>{title}</h2>
        {reset && (
          <>
            <output className="demo-feedback">
              <span key={revision}>{revision > 0 ? 'Preview reset.' : ''}</span>
            </output>
            <Button
              variant="ghost"
              tone="neutral"
              controlSize="small"
              className="demo-reset"
              aria-label="Reset preview"
              title="Reset preview"
              disabled={!ready}
              onClick={() => setRevision(value => value + 1)}
            >
              <ResetIcon />
            </Button>
          </>
        )}
      </div>
      <PreviewTheme key={revision}>{children}</PreviewTheme>

      {typeof sources === 'string' ? (
        <RemoteSources url={sources} />
      ) : (
        <details className="demo-sources">
          <summary>View source</summary>
          <SourceFiles sources={sources} />
        </details>
      )}
    </section>
  )
}

function ResetIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
      <path d="M2.5 2.5v3h3" />
    </svg>
  )
}

type PreviewThemeState = {
  theme: Theme
  mode: ThemeMode | undefined
  setTheme: (theme: Theme) => void
  setMode: (mode: ThemeMode | undefined) => void
}

const PreviewThemeContext = createContext<PreviewThemeState | null>(null)

/** The frame's selected theme, for playgrounds that pass it to a copyable example. */
export function usePreviewTheme() {
  const state = useContext(PreviewThemeContext)
  if (!state) throw new Error('DemoControls and DemoPreview need a DemoFrame.')
  return state
}

/**
 * The stage theme, with spatial motion forced off when `off`. For examples that demonstrate
 * their motion toggle: wrap the example in a `ThemeScope` that takes the returned theme.
 */
export function usePreviewMotionTheme(off: boolean): Theme {
  const { theme } = usePreviewTheme()
  return useMemo(
    () => ({ ...theme, motion: { ...theme.motion, mode: off ? 'off' : theme.motion.mode } }),
    [theme, off]
  )
}

/** Lives inside the reset boundary, so a reset also restores the theme and mode. */
function PreviewTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode | undefined>()
  return (
    <PreviewThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </PreviewThemeContext.Provider>
  )
}

/** Every file renders on the server; once hydrated, more than one file becomes tabs. */
function SourceFiles({ sources }: { sources: readonly DemoSource[] }) {
  const ready = useHydrated()
  const baseId = useId()
  const [selected, setSelected] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const tabbed = ready && sources.length > 1

  function select(index: number) {
    const next = (index + sources.length) % sources.length
    setSelected(next)
    tabs.current[next]?.focus()
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const target = {
      ArrowRight: selected + 1,
      ArrowLeft: selected - 1,
      Home: 0,
      End: sources.length - 1
    }[event.key]
    if (target === undefined) return
    event.preventDefault()
    select(target)
  }

  return (
    <>
      {tabbed && (
        <div
          role="tablist"
          aria-label="Source files"
          className="demo-source-tabs"
        >
          {sources.map((source, index) => (
            <button
              key={source.name}
              ref={node => {
                tabs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-controls={`${baseId}-panel-${index}`}
              aria-selected={index === selected}
              tabIndex={index === selected ? 0 : -1}
              title={source.name}
              onClick={() => setSelected(index)}
              onKeyDown={onTabKeyDown}
            >
              {source.name.split('/').at(-1)}
            </button>
          ))}
        </div>
      )}
      {sources.map((source, index) => (
        <SourceFile
          key={source.name}
          source={source}
          panel={
            tabbed
              ? {
                  id: `${baseId}-panel-${index}`,
                  tab: `${baseId}-tab-${index}`,
                  hidden: index !== selected
                }
              : undefined
          }
        />
      ))}
    </>
  )
}

type Listing =
  | { status: 'idle' | 'loading' | 'failed' }
  | { status: 'loaded'; sources: readonly DemoSource[] }

function RemoteSources({ url }: { url: string }) {
  const [listing, setListing] = useState<Listing>({ status: 'idle' })
  const details = useRef<HTMLDetailsElement>(null)
  const summary = useRef<HTMLElement>(null)

  async function load() {
    setListing({ status: 'loading' })
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`${url} answered ${response.status}`)
      setListing({ status: 'loaded', sources: await response.json() })
    } catch {
      setListing({ status: 'failed' })
    }
  }

  // The listing may have been opened before hydration, when no toggle handler was attached.
  useEffect(() => {
    if (details.current?.open) void load()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- Only the open state at hydration.
  }, [])

  return (
    <details
      ref={details}
      className="demo-sources"
      onToggle={event => {
        if (event.currentTarget.open && listing.status === 'idle') void load()
      }}
    >
      <summary ref={summary}>View source</summary>
      {listing.status === 'loaded' ? (
        <SourceFiles sources={listing.sources} />
      ) : (
        <div className="demo-sources-status">
          {listing.status === 'idle' && (
            <p>
              The source loads when JavaScript runs. <a href={url}>Open the listing as JSON</a>
            </p>
          )}
          <output>
            {listing.status === 'loading' && 'Loading source…'}
            {listing.status === 'failed' && 'The source did not load.'}
          </output>
          {listing.status === 'failed' && (
            <Button
              onClick={() => {
                summary.current?.focus()
                void load()
              }}
            >
              Retry
            </Button>
          )}
        </div>
      )}
    </details>
  )
}

function SourceFile({
  source,
  panel
}: {
  source: DemoSource
  panel?: { id: string; tab: string; hidden: boolean }
}) {
  const [feedback, setFeedback] = useState('')
  const [copying, setCopying] = useState(false)
  const ready = useHydrated()

  async function copy() {
    setCopying(true)
    setFeedback('')
    try {
      await navigator.clipboard.writeText(source.code)
      setFeedback(`Copied ${source.name}.`)
    } catch {
      setFeedback('Copy failed. Select and copy the code below.')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div
      className="demo-source"
      {...(panel && {
        id: panel.id,
        role: 'tabpanel',
        'aria-labelledby': panel.tab,
        hidden: panel.hidden
      })}
    >
      {!panel && <div className="demo-filename">{source.name}</div>}
      <div className="demo-source-actions">
        <output className="demo-copy-feedback">{feedback}</output>
        <Button
          variant="ghost"
          tone="neutral"
          controlSize="small"
          aria-label={`Copy ${source.name}`}
          title="Copy"
          disabled={!ready}
          aria-disabled={!ready || copying}
          onClick={() => {
            if (!copying) void copy()
          }}
        >
          {feedback.startsWith('Copied') ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: source.html }} />
    </div>
  )
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.5"
      />
      <path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8.5 3.5 3.5L13 4.5" />
    </svg>
  )
}

/** Example-specific controls and actions; the frame adds the theme and mode pickers. */
export function DemoControls({
  children,
  label = 'Controls',
  themePicker = true
}: {
  children?: ReactNode
  label?: string
  /** Hide the Theme picker when the example sets its own theme. */
  themePicker?: boolean
}) {
  const ready = useHydrated()
  return (
    <fieldset
      className="demo-controls"
      disabled={!ready}
    >
      <legend>{label}</legend>
      {children}
      <FrameThemeControls themePicker={themePicker} />
    </fieldset>
  )
}

const modes = { Site: undefined, Light: 'light', Dark: 'dark' } as const
const modeLabels = Object.keys(modes) as (keyof typeof modes)[]

function FrameThemeControls({ themePicker }: { themePicker: boolean }) {
  const { theme, mode, setTheme, setMode } = usePreviewTheme()
  const modeLabel = modeLabels.find(label => modes[label] === mode) ?? 'Site'
  return (
    <div className="demo-theme-controls">
      {themePicker && (
        <SelectControl
          label="Theme"
          value={theme.id}
          options={themes.map(preset => preset.id)}
          optionLabels={Object.fromEntries(themes.map(preset => [preset.id, preset.name]))}
          onChange={id => setTheme(themes.find(preset => preset.id === id) ?? radiant)}
        />
      )}
      <SelectControl
        label="Mode"
        value={modeLabel}
        options={modeLabels}
        onChange={label => setMode(modes[label])}
      />
    </div>
  )
}

/** The stage paints the selected theme edge to edge; examples inherit it. */
export function DemoPreview({
  children,
  label = 'Live preview'
}: {
  children: ReactNode
  label?: string
}) {
  const { theme, mode } = usePreviewTheme()
  return (
    <section
      className="demo-canvas"
      aria-label={label}
    >
      <ThemeScope
        theme={theme}
        mode={mode}
        className="demo-stage"
      >
        {children}
      </ThemeScope>
    </section>
  )
}
