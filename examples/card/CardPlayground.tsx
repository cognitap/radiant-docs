'use client'
import { useState } from 'react'
import type { CardHeadingLevel } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { CardExample, type CardTask } from './CardExample'
const levels = { h2: 2, h3: 3, h4: 4 } as const satisfies Record<string, CardHeadingLevel>
export function CardPlayground({ task = 'note' }: { task?: CardTask }) {
  const [level, setLevel] = useState<keyof typeof levels>(task === 'note' ? 'h2' : 'h3'),
    [padding, setPadding] = useState<'standard' | 'compact'>('standard')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Title level"
            value={level}
            options={['h2', 'h3', 'h4']}
            onChange={setLevel}
          />
          <SelectControl
            label="Padding"
            value={padding}
            options={['standard', 'compact']}
            onChange={setPadding}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <CardExample
          task={task}
          level={levels[level]}
          style={padding === 'compact' ? { '--rad-card-padding': '0.75rem' } : undefined}
        />
      </DemoPreview>
    </>
  )
}
