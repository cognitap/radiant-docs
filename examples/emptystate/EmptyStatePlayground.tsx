'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { EmptyStateExample, type EmptyStateTask } from './EmptyStateExample'
import type { EmptyStateTone, EmptyStateHeadingLevel } from '@cognitap/radiant'
const levels = { '2': 2, '3': 3, '4': 4 } as const
export function EmptyStatePlayground({ task = 'table' }: { task?: EmptyStateTask }) {
  const [tone, setTone] = useState<EmptyStateTone>('neutral'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [level, setLevel] = useState<keyof typeof levels>('3')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Tone"
            value={tone}
            options={['neutral', 'accent', 'warning', 'danger']}
            onChange={setTone}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Heading level"
            value={level}
            options={['2', '3', '4']}
            onChange={setLevel}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <EmptyStateExample
          task={task}
          tone={tone}
          dir={dir}
          level={levels[level] satisfies EmptyStateHeadingLevel}
        />
      </DemoPreview>
    </>
  )
}
