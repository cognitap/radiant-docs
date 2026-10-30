'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ToggleGroupExample, type ToggleGroupTask } from './ToggleGroupExample'
export function ToggleGroupPlayground({ task = 'alignment' }: { task?: ToggleGroupTask }) {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal'),
    [loop, setLoop] = useState(true),
    [disabled, setDisabled] = useState(false),
    [off, setOff] = useState(false)
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
        </div>
        <div className="action-toggles">
          <label>
            <input
              type="checkbox"
              checked={loop}
              onChange={event => setLoop(event.target.checked)}
            />
            Loop focus
          </label>
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
            Disabled
          </label>
          <label>
            <input
              type="checkbox"
              checked={off}
              onChange={event => setOff(event.target.checked)}
            />
            Motion off
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <ToggleGroupExample
          task={task}
          orientation={orientation}
          loop={loop}
          disabled={disabled}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
