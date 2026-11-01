'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { FileInputExample, type FileInputTask } from './FileInputExample'
import type { ControlSize } from '@cognitap/radiant'
export function FileInputPlayground({ task = 'protocol' }: { task?: FileInputTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [invalid, setInvalid] = useState(false),
    [required, setRequired] = useState(task === 'consent')
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
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Disabled"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          <Checkbox
            label="Invalid"
            checked={invalid}
            onChange={event => setInvalid(event.target.checked)}
          />
          <Checkbox
            label="Required"
            checked={required}
            onChange={event => setRequired(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <FileInputExample
          task={task}
          controlSize={size}
          dir={dir}
          disabled={disabled}
          invalid={invalid}
          required={required}
        />
      </DemoPreview>
    </>
  )
}
