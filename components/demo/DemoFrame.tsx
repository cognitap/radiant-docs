'use client'

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button } from '@cognitap/radiant'
import { useHydrated } from '@/examples/profile/useHydrated'

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
          <Button
            disabled={!ready}
            onClick={() => setRevision(value => value + 1)}
          >
            Reset preview
          </Button>
        )}
      </div>
      <Fragment key={revision}>{children}</Fragment>
      {reset && (
        <output className="demo-feedback">
          <span key={revision}>{revision > 0 ? 'Preview reset.' : ''}</span>
        </output>
      )}
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

function SourceFile({ source }: { source: DemoSource }) {
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
    <div className="demo-source">
      <div className="demo-source-heading">
        <span className="demo-filename">{source.name}</span>
        <Button
          aria-label={`Copy ${source.name}`}
          disabled={!ready}
          aria-disabled={!ready || copying}
          onClick={() => {
            if (!copying) void copy()
          }}
        >
          {copying ? 'Copying…' : 'Copy'}
        </Button>
      </div>
      <output className="demo-copy-feedback">{feedback}</output>
      <div dangerouslySetInnerHTML={{ __html: source.html }} />
    </div>
  )
}

/** Keep controls inside the frame's reset boundary, alongside the preview. */
export function DemoControls({
  children,
  label = 'Controls'
}: {
  children: ReactNode
  label?: string
}) {
  const ready = useHydrated()
  return (
    <fieldset
      className="demo-controls"
      disabled={!ready}
    >
      <legend>{label}</legend>
      {children}
    </fieldset>
  )
}

/** Compose a published Radiant theme/mode provider here when the example needs one. */
export function DemoPreview({
  children,
  label = 'Live preview'
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <section
      className="demo-canvas"
      aria-label={label}
    >
      {children}
    </section>
  )
}
