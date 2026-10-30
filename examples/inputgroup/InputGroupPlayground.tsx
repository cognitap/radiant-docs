'use client'
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
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
            Disabled control
          </label>
          <label>
            <input
              type="checkbox"
              checked={readOnly}
              onChange={event => setReadOnly(event.target.checked)}
            />
            Read only
          </label>
          <label>
            <input
              type="checkbox"
              checked={invalid}
              onChange={event => setInvalid(event.target.checked)}
            />
            Invalid control
          </label>
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
