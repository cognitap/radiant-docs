'use client'
import { Checkbox } from '@cognitap/radiant'
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
          <Checkbox
            label="Disabled actions"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          <Checkbox
            label="Pending actions"
            checked={pending}
            onChange={event => setPending(event.target.checked)}
          />
          <Checkbox
            label="Button motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
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
