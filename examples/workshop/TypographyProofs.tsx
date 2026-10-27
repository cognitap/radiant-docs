'use client'

/* oxlint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- Optional delegated text picking has an equivalent keyboard-operable text-style selector. */

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Button, ThemeScope, type Theme, type ThemeMode } from '@cognitap/radiant'
import { ProofPage, initialProofInteraction, type ProofInteraction } from './ProofPages'
import {
  proofCopy,
  proofNames,
  proofContexts,
  readCopy,
  type CopyEdits,
  type Proof
} from './proof-content'
import './typography-proofs.css'

/** Keep the actual CSS width, scaling only the displayed frame. No typography calculations here. */
function ProofFrame({
  width,
  theme,
  mode,
  proof,
  edits,
  interaction,
  onInteraction,
  spacing
}: {
  width: number
  theme: Theme
  mode: ThemeMode
  proof: Proof
  edits: CopyEdits
  interaction: ProofInteraction
  onInteraction: (patch: Partial<ProofInteraction>) => void
  spacing: boolean
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ available: width, height: 0 })
  useEffect(() => {
    const outer = viewport.current
    const inner = page.current
    if (!outer || !inner) return
    const measure = () =>
      setDimensions(previous => {
        const next = { available: outer.clientWidth, height: inner.offsetHeight }
        return previous.available === next.available && previous.height === next.height
          ? previous
          : next
      })
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(inner)
    measure()
    return () => observer.disconnect()
  }, [width])
  const scale = Math.min(1, dimensions.available / width)
  const style = {
    '--proof-width': `${width}px`,
    '--proof-scale': scale,
    height: dimensions.height ? dimensions.height * scale : undefined
  } as CSSProperties
  return (
    <figure
      className="proof-frame"
      data-proof-width={width}
      aria-label={`${proofNames[proof]} proof at ${width}px`}
    >
      <figcaption>
        {width}px CSS width · shown at {Math.round(scale * 100)}%
      </figcaption>
      <div
        ref={viewport}
        className="proof-viewport"
        data-proof-ready={dimensions.height > 0 || undefined}
        style={style}
      >
        <div
          ref={page}
          className="proof-scaled-page"
          data-proof-spacing={spacing || undefined}
        >
          <ThemeScope
            theme={theme}
            mode={mode}
            className="proof-page"
            data-rad-type-container=""
          >
            <ProofPage
              proof={proof}
              edits={edits}
              interaction={interaction}
              onInteraction={onInteraction}
            />
          </ThemeScope>
        </div>
      </div>
    </figure>
  )
}

export function TypographyProofs({
  theme,
  mode,
  selectedRole = 'prose-body',
  onSelectRole
}: {
  theme: Theme
  mode: ThemeMode
  selectedRole?: string
  onSelectRole?: (role: string) => void
}) {
  const [proof, setProof] = useState<Proof>('article')
  const [width, setWidth] = useState('800')
  const [edits, setEdits] = useState<CopyEdits>({})
  const [interaction, setInteraction] = useState(initialProofInteraction)
  const [spacing, setSpacing] = useState(false)
  const [inspecting, setInspecting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const roleSupport = Object.hasOwn(theme.modes.light, '--rad-typography-roles-prose-body-size')
  function updateInteraction(patch: Partial<ProofInteraction>) {
    setInteraction(previous => ({ ...previous, ...patch }))
  }
  function resetProof() {
    setEdits(previous => {
      const next = { ...previous }
      delete next[proof]
      return next
    })
    setInteraction(previous =>
      proof === 'form'
        ? {
            ...previous,
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            updates: true,
            saved: false,
            attempted: false
          }
        : proof === 'data'
          ? { ...previous, query: '' }
          : proof === 'landing'
            ? { ...previous, joined: false }
            : previous
    )
    setFeedback(
      `${proofNames[proof]} copy and interactions reset. Theme, other proofs and inspection controls retained.`
    )
  }
  return (
    <section
      className="typography-proofs"
      aria-label="Typography proof sheets"
      data-proof-roles={roleSupport ? 'supported' : 'unavailable'}
    >
      <div className="proof-heading">
        <div>
          <h3>Typography proof sheets</h3>
          <p>Judge the same words and theme in composed pages.</p>
        </div>
        <Button
          variant="outline"
          onClick={resetProof}
        >
          Reset current proof
        </Button>
      </div>
      <div className="workshop-options">
        <label>
          Proof composition
          <select
            value={proof}
            onChange={event => {
              const value = event.target.value
              if (Object.hasOwn(proofCopy, value)) setProof(value as Proof)
            }}
          >
            {Object.entries(proofNames).map(([key, label]) => (
              <option
                key={key}
                value={key}
              >
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Proof layout
          <select
            value={width}
            onChange={event => setWidth(event.target.value)}
          >
            <option value="800">Wide · 800px</option>
            <option value="640">Medium · 640px</option>
            <option value="390">Narrow · 390px</option>
            <option value="320">Small · 320px</option>
            <option value="compare">Compare · 800 + 390px</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={spacing}
            onChange={event => setSpacing(event.target.checked)}
          />
          Text spacing probe
        </label>
      </div>
      <p className="proof-context">
        {proofContexts[proof]}. Body / Headings / UI / Code assignments are distinct from the text
        styles.
      </p>
      {!roleSupport && (
        <p className="proof-availability">
          This installed release does not contain the new typography roles. These are semantic,
          editable content proofs; responsive role styling requires the matching packed candidate.
          The public package update will accompany the typesetting chapter release.
        </p>
      )}
      <details className="proof-copy-editor">
        <summary>Edit {proofNames[proof].toLowerCase()} copy</summary>
        <p>
          Plain text only. Changes appear in every width. Untouched passages keep their inline
          markup. Copy and form values stay in this session.
        </p>
        <div className="proof-copy-fields">
          {Object.entries(proofCopy[proof]).map(([key, fallback]) => (
            <label key={`${proof}:${key}`}>
              {proofNames[proof]} · {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              <textarea
                value={readCopy(edits, proof, key as keyof (typeof proofCopy)[typeof proof])}
                rows={fallback.length > 90 ? 3 : 2}
                onChange={event => {
                  const value = event.target.value
                  setEdits(previous => ({
                    ...previous,
                    [proof]: { ...previous[proof], [key]: value }
                  }))
                }}
              />
            </label>
          ))}
        </div>
      </details>
      <p className="proof-explanation">
        Frames retain their stated CSS widths and scale down to fit. Use 100% display size to judge
        reading comfort; the spacing probe is a layout check, not browser zoom. Preview mode follows
        the shared specimen mode below. Product controls use the installed component typography.
      </p>
      {roleSupport && onSelectRole && (
        <label className="proof-inspect-toggle">
          <input
            type="checkbox"
            checked={inspecting}
            onChange={event => setInspecting(event.target.checked)}
          />
          Inspect text styles (click text; actions pause while inspecting)
        </label>
      )}
      {inspecting && (
        <p className="proof-context">
          Selected style: {selectedRole}. Use the text-style selector for keyboard inspection and
          editing.
        </p>
      )}
      {inspecting && (
        <style>{`.proof-frames [data-rad-text="${/^[a-z-]+$/.test(selectedRole) ? selectedRole : 'prose-body'}"] { outline: 2px solid var(--rad-color-focus); outline-offset: 3px; }`}</style>
      )}
      <div
        onClickCapture={event => {
          if (!inspecting || !onSelectRole || !(event.target instanceof Element)) return
          const explicit = event.target.closest<HTMLElement>('[data-rad-text]')
          const block = event.target.closest('p,ul,ol,blockquote,pre,h1,h2,h3,h4,h5,h6')
          const automatic = block?.parentElement?.hasAttribute('data-rad-prose')
            ? (
                {
                  P: 'prose-body',
                  UL: 'prose-body',
                  OL: 'prose-body',
                  BLOCKQUOTE: 'prose-quote',
                  PRE: 'code',
                  H1: 'prose-title',
                  H2: 'prose-heading',
                  H3: 'prose-subheading',
                  H4: 'prose-subheading',
                  H5: 'prose-subheading',
                  H6: 'prose-subheading'
                } as Record<string, string>
              )[block.tagName]
            : undefined
          const role = explicit?.dataset.radText ?? automatic
          if (role) {
            event.preventDefault()
            event.stopPropagation()
            onSelectRole(role)
          }
        }}
        data-proof-inspecting={inspecting || undefined}
        className="proof-frames"
        data-proof-compare={width === 'compare' || undefined}
      >
        {(width === 'compare' ? [800, 390] : [Number(width)]).map(frameWidth => (
          <ProofFrame
            key={frameWidth}
            width={frameWidth}
            theme={theme}
            mode={mode}
            proof={proof}
            edits={edits}
            interaction={interaction}
            onInteraction={updateInteraction}
            spacing={spacing}
          />
        ))}
      </div>
      <output className="proof-feedback">{feedback}</output>
    </section>
  )
}
