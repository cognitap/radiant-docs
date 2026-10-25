'use client'

import { Fragment, useId, useState, type ReactNode } from 'react'
import { Button } from '@cognitap/radiant'
import { useHydrated } from '@/examples/profile/useHydrated'

type DemoSource = { name: string; code: string; highlighted: ReactNode }

export function DemoFrame({
  title,
  sources,
  children
}: {
  title: string
  sources: readonly DemoSource[]
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
        <Button
          disabled={!ready}
          onClick={() => setRevision(value => value + 1)}
        >
          Reset preview
        </Button>
      </div>
      <Fragment key={revision}>{children}</Fragment>
      <output className="demo-feedback">
        <span key={revision}>{revision > 0 ? 'Preview reset.' : ''}</span>
      </output>
      <details className="demo-sources">
        <summary>View source</summary>
        {sources.map(source => (
          <SourceFile
            key={source.name}
            source={source}
          />
        ))}
      </details>
    </section>
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
      {source.highlighted}
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
