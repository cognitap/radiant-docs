'use client'
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
              Read-only
            </label>
            <label>
              <input
                type="checkbox"
                checked={invalid}
                onChange={event => setInvalid(event.target.checked)}
              />
              Invalid
            </label>
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
