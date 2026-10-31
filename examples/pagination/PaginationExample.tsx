'use client'
import { useRef, useState } from 'react'
import {
  Pagination,
  PaginationButton,
  PaginationItem,
  PaginationList,
  type PaginationButtonProps,
  type PaginationProps
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const records = [
  ['Jordan Rivera', 'Sam Lee'],
  ['Avery Chen', 'Alex Morgan'],
  ['Robin Patel', 'Taylor Kim']
]
export function PaginationExample({
  controlSize,
  style
}: {
  controlSize?: PaginationButtonProps['controlSize']
  style?: PaginationProps['style']
}) {
  const [page, setPage] = useState(1)
  const numbered = useRef(new Map<number, HTMLButtonElement>())
  function go(next: number, fromBoundary = false) {
    setPage(next)
    // A boundary button disables itself, so move focus to the page it reached.
    if (fromBoundary && (next === 1 || next === records.length)) numbered.current.get(next)?.focus()
  }
  return (
    <div style={{ width: '32rem', maxWidth: '100%' }}>
      <output
        aria-label="Record page"
        aria-live="polite"
      >
        Page {page} of {records.length}
      </output>
      <ul aria-label="Visible records">
        {records[page - 1]!.map(name => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <Pagination
        aria-label="Record pages"
        style={style}
      >
        <PaginationList>
          <PaginationItem>
            <PaginationButton
              controlSize={controlSize}
              disabled={page === 1}
              onClick={() => go(page - 1, true)}
            >
              Previous
            </PaginationButton>
          </PaginationItem>
          {records.map((_, index) => {
            const n = index + 1
            return (
              <PaginationItem key={n}>
                <PaginationButton
                  ref={host => {
                    if (host) numbered.current.set(n, host)
                    else numbered.current.delete(n)
                  }}
                  controlSize={controlSize}
                  current={page === n}
                  aria-label={`Page ${n}`}
                  onClick={() => go(n)}
                >
                  {n}
                </PaginationButton>
              </PaginationItem>
            )
          })}
          <PaginationItem>
            <PaginationButton
              controlSize={controlSize}
              disabled={page === records.length}
              onClick={() => go(page + 1, true)}
            >
              Next
            </PaginationButton>
          </PaginationItem>
        </PaginationList>
      </Pagination>
    </div>
  )
}
