'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { OTPFieldExample, type OTPFieldTask } from './OTPFieldExample'
import type { OTPFieldMode, ControlSize } from '@cognitap/radiant'
export function OTPFieldPlayground({ task = 'email' }: { task?: OTPFieldTask }) {
  const [length, setLength] = useState(task === 'access' ? '8' : '6'),
    [mode, setMode] = useState<OTPFieldMode>(task === 'access' ? 'alphanumeric' : 'numeric'),
    [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [readOnly, setReadOnly] = useState(false),
    [prefill, setPrefill] = useState(false)
  const initial = prefill
    ? (mode === 'numeric' ? '123456789012' : 'AB12CD34EF56').slice(0, Number(length))
    : undefined
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Code length"
            value={length}
            options={['4', '6', '8']}
            onChange={setLength}
          />
          <SelectControl
            label="Code mode"
            value={mode}
            options={['numeric', 'alphanumeric']}
            onChange={setMode}
          />
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
            label="Read only"
            checked={readOnly}
            onChange={event => setReadOnly(event.target.checked)}
          />
          <Checkbox
            label="Initially filled"
            checked={prefill}
            onChange={event => setPrefill(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <OTPFieldExample
          key={length + mode + String(prefill)}
          task={task}
          length={Number(length)}
          mode={mode}
          controlSize={size}
          dir={dir}
          disabled={disabled}
          readOnly={readOnly}
          initialValue={initial}
        />
      </DemoPreview>
    </>
  )
}
