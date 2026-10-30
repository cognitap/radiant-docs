'use client'
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
              checked={readOnly}
              onChange={event => setReadOnly(event.target.checked)}
            />
            Read only
          </label>
          <label>
            <input
              type="checkbox"
              checked={prefill}
              onChange={event => setPrefill(event.target.checked)}
            />
            Initially filled
          </label>
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
