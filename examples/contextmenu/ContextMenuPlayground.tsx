'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ContextMenuExample, type ContextMenuTask } from './ContextMenuExample'
import type { ContextMenuContentProps } from '@cognitap/radiant'
export function ContextMenuPlayground({ task = 'file' }: { task?: ContextMenuTask }) {
  const [side, setSide] = useState<NonNullable<ContextMenuContentProps['side']>>('bottom'),
    [align, setAlign] = useState<NonNullable<ContextMenuContentProps['align']>>('start'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [off, setOff] = useState(false),
    [initial, setInitial] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Side"
            value={side}
            options={['top', 'right', 'bottom', 'left']}
            onChange={setSide}
          />
          <SelectControl
            label="Align"
            value={align}
            options={['start', 'center', 'end']}
            onChange={setAlign}
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
            label="Motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
          <Checkbox
            label="Initially open"
            checked={initial}
            onChange={event => setInitial(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <ContextMenuExample
          key={String(initial)}
          task={task}
          initialOpen={initial}
          side={side}
          align={align}
          dir={dir}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
