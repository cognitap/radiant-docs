'use client'

import { useId, type ReactNode } from 'react'
import type { Changes, Fields } from './workshop-fields'

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
