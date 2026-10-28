'use client'

/* oxlint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- Optional delegated text picking has an equivalent keyboard-operable text-style selector. */

import { useId, type ReactNode } from 'react'
import { pageContexts, pageNames, readCopy, sceneCopy } from './page-copy'
import type { ToolProps } from './preview-tools'

const blockRoles: Record<string, string> = {
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
}
const automaticSelection: Record<string, string> = {
  'prose-body':
    '[data-rad-prose] > :is(p,ul,ol):not([data-rad-text],[data-slot],[data-rad-not-prose])',
  'prose-quote':
    '[data-rad-prose] > blockquote:not([data-rad-text],[data-slot],[data-rad-not-prose])'
}

/** Click picking highlights the selected style and pauses actions while active. */
export function TextInspection({
  enabled,
  role,
  onRole,
  children
}: {
  enabled: boolean
  role: string
  onRole: (role: string) => void
  children: ReactNode
}) {
  const id = useId()
  const scope = `[data-text-inspector=${JSON.stringify(id)}]`
  const safeRole = /^[a-z-]+$/.test(role) ? role : 'prose-body'
  const automatic = automaticSelection[safeRole]
  return (
    <div
      data-text-inspector={id}
      data-text-inspecting={enabled || undefined}
      onClickCapture={event => {
        if (!enabled || !(event.target instanceof Element)) return
        event.preventDefault()
        event.stopPropagation()
        const explicit = event.target.closest<HTMLElement>('[data-rad-text]')
        const block = event.target.closest('p,ul,ol,blockquote,pre,h1,h2,h3,h4,h5,h6')
        const inferred = block?.parentElement?.hasAttribute('data-rad-prose')
          ? blockRoles[block.tagName]
          : undefined
        const next = explicit?.dataset.radText ?? inferred
        if (next) onRole(next)
      }}
    >
      {enabled && (
        <style>{`${scope} [data-rad-text="${safeRole}"]${automatic ? `, ${scope} ${automatic}` : ''} { outline: 2px solid var(--rad-color-focus); outline-offset: 3px; }`}</style>
      )}
      {children}
    </div>
  )
}

export function TypographyTools({ view, session, dispatch, disabled, role }: ToolProps) {
  const page = view.scene.kind === 'page' ? view.scene.page : undefined
  return (
    <div className="preview-tools">
      <div className="preview-probes">
        <label>
          <input
            type="checkbox"
            disabled={disabled}
            checked={view.probes.inspectText}
            onChange={event =>
              dispatch({ type: 'probe', probe: 'inspectText', on: event.target.checked })
            }
          />
          Inspect text styles (click text; actions pause while inspecting)
        </label>
        <label>
          <input
            type="checkbox"
            disabled={disabled}
            checked={view.probes.textSpacing}
            onChange={event =>
              dispatch({ type: 'probe', probe: 'textSpacing', on: event.target.checked })
            }
          />
          Text spacing probe
        </label>
      </div>
      <p className="preview-note">
        {view.probes.inspectText ? `Selected style: ${role}. ` : ''}
        {page ? `${pageContexts[page]}.` : 'Component controls use the installed UI styles.'}
      </p>
      {page && (
        <details className="preview-copy-editor">
          <summary>Edit {pageNames[page].toLowerCase()} copy</summary>
          <p className="preview-note">
            Plain text only. Changes appear in every frame and stay in this session.
          </p>
          <div className="preview-copy-fields">
            {Object.entries(sceneCopy[page]).map(([key, fallback]) => (
              <label key={`${page}:${key}`}>
                {pageNames[page]} · {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                <textarea
                  disabled={disabled}
                  value={readCopy(session.copy, page, key as keyof (typeof sceneCopy)[typeof page])}
                  rows={fallback.length > 90 ? 3 : 2}
                  onChange={event =>
                    dispatch({ type: 'copy', page, key, value: event.target.value })
                  }
                />
              </label>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
