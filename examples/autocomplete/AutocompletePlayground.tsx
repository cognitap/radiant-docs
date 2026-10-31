'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { AutocompleteExample, type AutocompleteTask } from './AutocompleteExample'
import type { ControlSize } from '@cognitap/radiant'
export function AutocompletePlayground({ task = 'topic' }: { task?: AutocompleteTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [readOnly, setReadOnly] = useState(false),
    [invalid, setInvalid] = useState(false),
    [required, setRequired] = useState(true)
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
          <Checkbox
            label="Invalid"
            checked={invalid}
            onChange={e => setInvalid(e.target.checked)}
          />
          <Checkbox
            label="Required"
            checked={required}
            onChange={e => setRequired(e.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <AutocompleteExample
          task={task}
          controlSize={size}
          dir={dir}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
          required={required}
        />
      </DemoPreview>
    </>
  )
}
