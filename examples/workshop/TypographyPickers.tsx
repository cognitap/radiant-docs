'use client'

import { useId, type ReactNode } from 'react'
import { Radio, RadioGroup, ToggleGroup, ToggleGroupItem } from '@cognitap/radiant'
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
  return (
    <RadioGroup
      label={label}
      className="face-fieldset"
      data-pairs={options.some(option => option.faces.length > 1) || undefined}
      aria-describedby={describedBy}
      controlSize="small"
      value={value}
      onValueChange={onChange}
      parts={{ label: { className: 'workshop-sr-only' }, options: { className: 'face-group' } }}
    >
      {options.map(option => {
        const pair = option.faces.length > 1
        return (
          <Radio
            key={option.value}
            value={option.value}
            aria-label={option.name}
            parts={{ wrapper: { className: 'face-card' }, label: { className: 'face-body' } }}
            label={
              <>
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
                        <span className="face-text">Body text reads on.</span>
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
              </>
            }
          />
        )
      })}
    </RadioGroup>
  )
}

export interface ChipOption {
  value: string
  label: string
  /** A dot on the chip, with this text describing it to assistive technology. */
  marked?: string
}
/** Small toggle chips for a short enumeration. */
export function Chips({
  label,
  options,
  value,
  describedBy,
  onChange
}: {
  label: string
  options: readonly ChipOption[]
  value: string
  describedBy?: string
  onChange: (value: string) => void
}) {
  const id = useId()
  return (
    <ToggleGroup
      className="chip-group"
      variant="segmented"
      aria-label={label}
      aria-describedby={describedBy}
      controlSize="small"
      value={value}
      onValueChange={next => {
        if (next !== null) onChange(next)
      }}
    >
      {options.map(option => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-describedby={option.marked ? `${id}-${option.value}` : undefined}
        >
          {option.label}
          {option.marked && (
            <>
              <span
                className="chip-dot"
                aria-hidden="true"
              />
              <span
                id={`${id}-${option.value}`}
                hidden
              >
                {option.marked}
              </span>
            </>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
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
    <RadioGroup
      label="Text style"
      controlSize="small"
      value={value}
      onValueChange={onChange}
      parts={{
        label: { className: 'workshop-sr-only' },
        options: { className: 'typesetting-roles' }
      }}
    >
      {rows.map(row => (
        <Radio
          key={row.role}
          value={row.role}
          aria-label={row.name}
          aria-describedby={row.overridden ? `${id}-${row.role}` : undefined}
          parts={{ wrapper: { className: 'role-row' }, label: { className: 'role-body' } }}
          label={
            <>
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
            </>
          }
        />
      ))}
    </RadioGroup>
  )
}
