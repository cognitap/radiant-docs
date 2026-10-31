'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ToolbarExample, type ToolbarTask } from './ToolbarExample'
export function ToolbarPlayground({ task = 'editor' }: { task?: ToolbarTask }) {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
      task === 'canvas' ? 'vertical' : 'horizontal'
    ),
    [loop, setLoop] = useState(task !== 'canvas'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Orientation"
            value={orientation}
            options={['horizontal', 'vertical']}
            onChange={setOrientation}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
        </div>
        <Checkbox
          label="Loop focus"
          checked={loop}
          onChange={event => setLoop(event.target.checked)}
        />
      </DemoControls>
      <DemoPreview>
        <ToolbarExample
          task={task}
          orientation={orientation}
          loop={loop}
          dir={dir}
        />
      </DemoPreview>
    </>
  )
}
