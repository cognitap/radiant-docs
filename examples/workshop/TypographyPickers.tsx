'use client'

import { useId, type ReactNode } from 'react'
import type { Face, FaceOption, Specimen } from './workshop-typography-view'

/** One sample, drawn in its face only once the file is in. */
function FaceSample({ face, children }: { face: Face; children: ReactNode }) {
  if (face.state === 'ready')
    return (
      <span
        className="face-sample"
        style={{ fontFamily: face.family }}
      >
        {children}
      </span>
    )
  return (
    <span
      className="face-sample"
      data-face={face.state}
    >
      {face.state === 'loading' ? 'Loading…' : 'File missing'}
    </span>
  )
}

/** Radio cards, each rendered in the family it offers. One tab stop; arrows move. */
export function FaceCards({
  label,
  options,
  value,
  describedBy,
  onChange
}: {
  label: string
  options: readonly FaceOption[]
  value: string
  describedBy?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div
      className="face-group"
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
    >
      {options.map(option => {
        const pair = option.faces.length > 1
        return (
          <label
            key={option.value}
            className="face-card"
            data-pair={pair || undefined}
            data-face={option.faces.some(face => face.state !== 'ready') ? 'pending' : undefined}
          >
            <input
              type="radio"
              name={id}
              value={option.value}
              checked={option.value === value}
              aria-label={option.name}
              onChange={() => onChange(option.value)}
            />
            <span
              className="face-preview"
              aria-hidden="true"
            >
              {pair ? (
                <>
                  <FaceSample face={option.faces[0]!}>
                    <span className="face-heading">Heading</span>
                  </FaceSample>
                  <FaceSample face={option.faces[1]!}>
                    <span className="face-body">Body text reads on.</span>
                  </FaceSample>
                </>
              ) : (
                <FaceSample face={option.faces[0]!}>
                  <span className="face-aa">Aa</span>
                </FaceSample>
              )}
            </span>
            <span className="face-name">
              {option.name}
              {option.note && <small> · {option.note}</small>}
            </span>
          </label>
        )
      })}
    </div>
  )
}

/** Small radio chips for a short enumeration. */
export function Chips({
  label,
  options,
  value,
  describedBy,
  onChange
}: {
  label: string
  options: readonly { value: string; label: string }[]
  value: string
  describedBy?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <div
      className="chip-group"
      role="radiogroup"
      aria-label={label}
      aria-describedby={describedBy}
    >
      {options.map(option => (
        <label
          key={option.value}
          className="chip"
        >
          <input
            type="radio"
            name={id}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}

export interface RoleRow {
  role: string
  name: string
  specimen: Specimen
  overridden: boolean
}
/** The text styles, each row a live specimen of its own style. Selecting a row selects the role. */
export function RoleList({
  rows,
  value,
  onChange
}: {
  rows: readonly RoleRow[]
  value: string
  onChange: (role: string) => void
}) {
  const id = useId()
  return (
    <div
      className="typesetting-roles"
      role="radiogroup"
      aria-label="Text style"
    >
      {rows.map(row => (
        <label
          key={row.role}
          className="role-row"
          data-overridden={row.overridden || undefined}
        >
          <input
            type="radio"
            name={id}
            value={row.role}
            checked={row.role === value}
            aria-label={row.name}
            aria-describedby={row.overridden ? `${id}-${row.role}` : undefined}
            onChange={() => onChange(row.role)}
          />
          <span
            className="role-specimen"
            aria-hidden="true"
            data-face={row.specimen.ready ? undefined : 'loading'}
            style={
              row.specimen.ready
                ? {
                    fontFamily: row.specimen.fontFamily,
                    fontSize: row.specimen.fontSize,
                    fontWeight: row.specimen.fontWeight,
                    letterSpacing: row.specimen.letterSpacing,
                    lineHeight: row.specimen.lineHeight
                  }
                : undefined
            }
          >
            {row.name}
          </span>
          <span
            className="role-meta"
            aria-hidden="true"
          >
            {row.specimen.meta}
          </span>
          {row.overridden && (
            <span
              id={`${id}-${row.role}`}
              className="role-dot"
              title="Overridden"
            >
              <span className="workshop-sr-only">overridden</span>
            </span>
          )}
        </label>
      ))}
    </div>
  )
}
