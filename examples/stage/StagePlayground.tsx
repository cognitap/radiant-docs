'use client'
import { type Spacing } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { StageExample, type StageTask } from './StageExample'
export function StagePlayground({ task = 'gradient' }: { task?: StageTask }) {
  const [width, setWidth] = useState<'360px' | '720px'>('720px'),
    [padding, setPadding] = useState<Spacing>('normal')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Width"
            value={width}
            options={['360px', '720px']}
            onChange={setWidth}
          />
          <SelectControl
            label="Padding"
            value={padding}
            options={['tight', 'normal', 'airy']}
            onChange={setPadding}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <StageExample
          task={task}
          width={width}
          padding={padding}
        />
      </DemoPreview>
    </>
  )
}
