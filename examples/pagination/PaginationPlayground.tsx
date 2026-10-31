'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import type { PaginationLinkProps } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PaginationExample } from './PaginationExample'
import { ResultPages } from './ResultPagesExample'
export type PaginationTask = 'records' | 'links' | 'boundaries'
const pages = ['1', '2', '3', '4', '5'] as const
export function PaginationPlayground({ task = 'records' }: { task?: PaginationTask }) {
  const [controlSize, setSize] =
      useState<NonNullable<PaginationLinkProps['controlSize']>>('medium'),
    [compact, setCompact] = useState(false),
    [page, setPage] = useState<(typeof pages)[number]>('2')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
          {task === 'links' && (
            <SelectControl
              label="Current page"
              value={page}
              options={pages}
              onChange={setPage}
            />
          )}
        </div>
        {task === 'records' && (
          <Checkbox
            label="Compact spacing"
            checked={compact}
            onChange={event => setCompact(event.target.checked)}
          />
        )}
      </DemoControls>
      <DemoPreview>
        {task === 'records' && (
          <PaginationExample
            controlSize={controlSize}
            style={{ '--rad-pagination-gap': compact ? '0.125rem' : '0.5rem' }}
          />
        )}
        {task === 'links' && (
          <ResultPages
            page={Number(page)}
            pageCount={pages.length}
            controlSize={controlSize}
          />
        )}
        {task === 'boundaries' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <ResultPages
              page={1}
              pageCount={12}
              label="First page of results"
              controlSize={controlSize}
            />
            <ResultPages
              page={12}
              pageCount={12}
              label="Last page of results"
              controlSize={controlSize}
            />
          </div>
        )}
      </DemoPreview>
    </>
  )
}
