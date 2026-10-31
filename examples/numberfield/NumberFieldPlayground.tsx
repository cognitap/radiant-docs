'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import type { ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { NumberFieldExample, type NumberFieldTask } from './NumberFieldExample'
export function NumberFieldPlayground({ task = 'participants' }: { task?: NumberFieldTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [readOnly, setReadOnly] = useState(false)
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
            onChange={e => setDisabled(e.target.checked)}
          />
          <Checkbox
            label="Read only"
            checked={readOnly}
            onChange={e => setReadOnly(e.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <NumberFieldExample
          task={task}
          controlSize={size}
          dir={dir}
          disabled={disabled}
          readOnly={readOnly}
        />
      </DemoPreview>
    </>
  )
}
