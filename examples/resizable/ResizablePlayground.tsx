'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import type { Orientation } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ResizableExample, type ResizableTask } from './ResizableExample'
export function ResizablePlayground({ task = 'files' }: { task?: ResizableTask }) {
  const [orientation, setOrientation] = useState<Orientation>(
      task === 'notes' ? 'vertical' : 'horizontal'
    ),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false)
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
        <div className="action-toggles">
          <Checkbox
            label="Lock layout"
            checked={disabled}
            onChange={e => setDisabled(e.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <ResizableExample
          task={task}
          orientation={orientation}
          dir={dir}
          disabled={disabled}
        />
      </DemoPreview>
    </>
  )
}
