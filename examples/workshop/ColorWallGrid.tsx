'use client'

/* oxlint-disable jsx-a11y/no-noninteractive-element-to-interactive-role -- One roving tab stop over 198 swatches. */
/* oxlint-disable react/forbid-elements -- A role="grid" table; Radiant's Table does not take a role. */

import { useState, type KeyboardEvent } from 'react'
import { roleNames, type Mode, type Role, type WallView, type WorkingRole } from './workshop-color'

/** What a wall click sets: one semantic role's exact shade, or one working role's family. */
export type WallPick =
  | { kind: 'role'; mode: Mode; role: Role; value: string | undefined }
  | { kind: 'family'; name: WorkingRole; paletteId: string }

/** The 18x11 wall as one tab stop: arrows move, Enter or Space picks. */
export function ColorWallGrid({
  wall,
  pick,
  disabled,
  onPick
}: {
  wall: WallView
  pick: WallPick
  disabled?: boolean
  onPick: (paletteId: string, stop: number, value: string) => void
}) {
  const [active, setActive] = useState(() => {
    const anchor = wall.color.anchor
    const row = anchor ? wall.color.palettes.findIndex(p => p.id === anchor.paletteId) : 0
    const col = anchor ? wall.color.palettes[0]!.swatches.findIndex(s => s.stop === anchor.stop) : 0
    return { row: Math.max(0, row), col: Math.max(0, col) }
  })
  const rows = wall.color.palettes.length
  const cols = wall.color.palettes[0]!.swatches.length
  const onKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      Home: [0, -cols],
      End: [0, cols],
      PageUp: [-rows, 0],
      PageDown: [rows, 0]
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const next = {
      row: Math.min(rows - 1, Math.max(0, active.row + move[0])),
      col: Math.min(cols - 1, Math.max(0, active.col + move[1]))
    }
    setActive(next)
    event.currentTarget
      .querySelector<HTMLElement>(`[data-row="${next.row}"][data-col="${next.col}"]`)
      ?.focus()
  }
  const target =
    pick.kind === 'role'
      ? `${pick.mode} ${roleNames[pick.role].toLowerCase()}`
      : `${pick.name} family`
  return (
    <table
      role="grid"
      className="color-wall"
      aria-label={`Color wall, pick for ${target}`}
      onKeyDown={onKeyDown}
    >
      <thead>
        <tr>
          <th scope="col">Family</th>
          {wall.color.palettes[0]!.swatches.map(s => (
            <th
              scope="col"
              key={s.stop}
            >
              {s.stop}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {wall.color.palettes.map((p, row) => (
          <tr
            key={p.id}
            data-selected={(pick.kind === 'family' && pick.paletteId === p.id) || undefined}
          >
            <th scope="row">{p.name}</th>
            {p.swatches.map((s, col) => {
              const chosen = pick.kind === 'role' ? pick.value === s.value : pick.paletteId === p.id
              return (
                <td key={s.stop}>
                  <button
                    type="button"
                    className="color-swatch"
                    data-row={row}
                    data-col={col}
                    tabIndex={active.row === row && active.col === col ? 0 : -1}
                    disabled={disabled}
                    style={{ backgroundColor: s.value }}
                    aria-label={
                      pick.kind === 'role'
                        ? `Use ${p.name} ${s.stop} ${s.value} for ${target}`
                        : `Use ${p.name} for ${target}`
                    }
                    aria-pressed={chosen}
                    onClick={() => {
                      setActive({ row, col })
                      onPick(p.id, s.stop, s.value)
                    }}
                  />
                  <span className="workshop-sr-only">{s.value}</span>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
