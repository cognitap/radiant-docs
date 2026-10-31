'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ProgressExample, type ProgressTask } from './ProgressExample'
export function ProgressPlayground({ task = 'export' }: { task?: ProgressTask }) {
  const [unknown, setUnknown] = useState(false),
    [height, setHeight] = useState<'standard' | 'large'>('standard')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          {task === 'export' && (
            <Checkbox
              label="Unknown remaining amount"
              checked={unknown}
              onChange={event => setUnknown(event.target.checked)}
            />
          )}
          <SelectControl
            label="Bar height"
            value={height}
            options={['standard', 'large']}
            onChange={setHeight}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <ProgressExample
          task={task}
          unknown={unknown}
          style={height === 'large' ? { '--rad-progress-height': '1rem' } : undefined}
        />
      </DemoPreview>
    </>
  )
}
