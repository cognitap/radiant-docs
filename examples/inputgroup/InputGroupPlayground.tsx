'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { InputGroupExample, type InputGroupTask } from './InputGroupExample'
import type { ControlSize } from '@cognitap/radiant'
export function InputGroupPlayground({ task = 'find' }: { task?: InputGroupTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [modifier, setModifier] = useState<'Control' | 'Command'>('Control'),
    [disabled, setDisabled] = useState(false),
    [readOnly, setReadOnly] = useState(false),
    [invalid, setInvalid] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={size}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          {task === 'find' && (
            <SelectControl
              label="Modifier"
              value={modifier}
              options={['Control', 'Command']}
              onChange={setModifier}
            />
          )}
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Disabled control"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          <Checkbox
            label="Read only"
            checked={readOnly}
            onChange={event => setReadOnly(event.target.checked)}
          />
          <Checkbox
            label="Invalid control"
            checked={invalid}
            onChange={event => setInvalid(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <InputGroupExample
          task={task}
          controlSize={size}
          dir={dir}
          modifier={modifier}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
        />
      </DemoPreview>
    </>
  )
}
