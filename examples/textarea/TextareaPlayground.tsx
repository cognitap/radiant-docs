'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import type { TextareaProps } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TextareaExample, type TextareaTask } from './TextareaExample'
export function TextareaPlayground({ task = 'describe' }: { task?: TextareaTask }) {
  const [controlSize, setSize] = useState<NonNullable<TextareaProps['controlSize']>>('medium'),
    [disabled, setDisabled] = useState(false),
    [readOnly, setReadOnly] = useState(false),
    [invalid, setInvalid] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
        </div>
        {task === 'describe' && (
          <div className="action-toggles">
            <Checkbox
              label="Disabled"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
            <Checkbox
              label="Read-only"
              checked={readOnly}
              onChange={event => setReadOnly(event.target.checked)}
            />
            <Checkbox
              label="Invalid"
              checked={invalid}
              onChange={event => setInvalid(event.target.checked)}
            />
          </div>
        )}
      </DemoControls>
      <DemoPreview>
        <TextareaExample
          task={task}
          controlSize={controlSize}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
        />
      </DemoPreview>
    </>
  )
}
