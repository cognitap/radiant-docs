'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ButtonGroupExample, type ButtonGroupTask } from './ButtonGroupExample'
import type { ControlSize } from '@cognitap/radiant'
export function ButtonGroupPlayground({ task = 'project' }: { task?: ButtonGroupTask }) {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [size, setSize] = useState<ControlSize>('medium'),
    [disabled, setDisabled] = useState(false),
    [pending, setPending] = useState(false),
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
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Button size"
            value={size}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
        </div>
        <div className="action-toggles">
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
            Disabled actions
          </label>
          <label>
            <input
              type="checkbox"
              checked={pending}
              onChange={event => setPending(event.target.checked)}
            />
            Pending actions
          </label>
          <label>
            <input
              type="checkbox"
              checked={off}
              onChange={event => setOff(event.target.checked)}
            />
            Button motion off
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <ButtonGroupExample
          task={task}
          orientation={orientation}
          dir={dir}
          controlSize={size}
          disabled={disabled}
          pending={pending}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
