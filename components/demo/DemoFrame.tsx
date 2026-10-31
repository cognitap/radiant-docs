'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import {
  Button,
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopy,
  CodeBlockHeader,
  CodeBlockViewport,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Fieldset,
  ThemeScope,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { radiant, themes } from '@cognitap/radiant/examples'
import { useHydrated } from '@/examples/profile/useHydrated'
import { SelectControl } from './ActionControls'

/** `html` is the highlighted lines of `code`, rendered on the server. */
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
        <Collapsible className="demo-sources">
          <CollapsibleTrigger className="demo-sources-trigger">View source</CollapsibleTrigger>
          <CollapsibleContent>
            <SourceFiles sources={sources} />
          </CollapsibleContent>
        </Collapsible>
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

function SourceFiles({ sources }: { sources: readonly DemoSource[] }) {
  return sources.map(source => (
    <SourceFile
      key={source.name}
      source={source}
    />
  ))
}

type Listing =
  | { status: 'idle' | 'loading' | 'failed' }
  | { status: 'loaded'; sources: readonly DemoSource[] }

function RemoteSources({ url }: { url: string }) {
  const [open, setOpen] = useState(false)
  const [listing, setListing] = useState<Listing>({ status: 'idle' })
  const trigger = useRef<HTMLElement>(null)

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

  // Collapsible adopts a listing opened before hydration, so this also covers that case.
  useEffect(() => {
    if (open && listing.status === 'idle') void load()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- load only reads the URL.
  }, [open, listing.status])

  return (
    <Collapsible
      className="demo-sources"
      open={open}
      onOpenChange={setOpen}
    >
      <CollapsibleTrigger
        ref={trigger}
        className="demo-sources-trigger"
      >
        View source
      </CollapsibleTrigger>
      <CollapsibleContent>
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
                  trigger.current?.focus()
                  void load()
                }}
              >
                Retry
              </Button>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

function SourceFile({ source }: { source: DemoSource }) {
  const ready = useHydrated()
  return (
    <CodeBlock
      code={source.code}
      copiedText={`Copied ${source.name}.`}
    >
      <CodeBlockHeader>
        <span className="demo-filename">{source.name}</span>
        <CodeBlockCopy
          controlSize="small"
          variant="outline"
          aria-label={`Copy ${source.name}`}
          disabled={!ready}
        >
          Copy
        </CodeBlockCopy>
      </CodeBlockHeader>
      <CodeBlockViewport aria-label={`Source: ${source.name}`}>
        <CodeBlockContent>
          <span dangerouslySetInnerHTML={{ __html: source.html }} />
        </CodeBlockContent>
      </CodeBlockViewport>
    </CodeBlock>
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
    <Fieldset
      legend={label}
      className="demo-controls"
      parts={{ legend: { className: 'demo-controls-legend' } }}
      disabled={!ready}
    >
      {children}
      <FrameThemeControls themePicker={themePicker} />
    </Fieldset>
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
