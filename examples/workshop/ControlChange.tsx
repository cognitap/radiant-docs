'use client'

import { useId, type ReactNode } from 'react'
import type { Changes, Fields } from './workshop-fields'

const focusable = 'input:not([type="hidden"]), select, textarea, button'
/** Bring one editor's field control into view, focus it and flash it; the matching Changed wrapper names the field. */
export function focusControl(root: ParentNode, field: string): HTMLElement | null {
  const control = [
    ...root.querySelectorAll<HTMLElement>(`[data-field=${JSON.stringify(field)}]`)
  ].find(element => !element.closest('[hidden]'))
  if (!control) return null
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  control.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
  control.querySelector<HTMLElement>(focusable)?.focus({ preventScroll: true })
  control.setAttribute('data-jumped', '')
  window.setTimeout(() => control.removeAttribute('data-jumped'), 1500)
  return control
}

const describe = (value: unknown) => (value === undefined ? 'the default' : String(value))

/** One field of one editor: marks the control when it left its baseline and puts it back. */
export function Changed<F extends Fields, K extends keyof F & string>({
  changes,
  field,
  label,
  set,
  format = describe,
  children
}: {
  changes: Changes<F> | null
  field: K
  label: string
  set: (value: F[K]) => void
  format?: (value: F[K]) => string
  children: (describedBy: string | undefined) => ReactNode
}) {
  const id = useId()
  const changed = changes !== null && changes.fields[field] !== changes.baseline[field]
  return (
    <div
      className="control-change"
      data-field={field}
      data-changed={changed || undefined}
    >
      {children(changed ? id : undefined)}
      {changed && (
        <span className="control-change-marker">
          <span id={id}>Changed from {format(changes.baseline[field])}</span>
          <button
            type="button"
            aria-label={`Reset ${label}`}
            onClick={() => set(changes.baseline[field])}
          >
            Reset
          </button>
        </span>
      )}
    </div>
  )
}
