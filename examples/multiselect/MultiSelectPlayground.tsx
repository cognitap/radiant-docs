'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { MultiSelectExample, type MultiSelectTask } from './MultiSelectExample'
export function MultiSelectPlayground({ task }: { task?: MultiSelectTask }) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [size, setSize] = useState<'small' | 'medium' | 'large'>('medium'),
    [readOnly, setReadOnly] = useState(false),
    [empty, setEmpty] = useState(false),
    [loading, setLoading] = useState(false),
    [fail, setFail] = useState(false),
    [initial, setInitial] = useState(false),
    [off, setOff] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Control size"
            value={size}
            options={['small', 'medium', 'large']}
            onChange={setSize}
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
              checked={empty}
              onChange={event => setEmpty(event.target.checked)}
            />
            Initially empty
          </label>
          <label>
            <input
              type="checkbox"
              checked={loading}
              onChange={event => setLoading(event.target.checked)}
            />
            Loading
          </label>
          <label>
            <input
              type="checkbox"
              checked={fail}
              onChange={event => setFail(event.target.checked)}
            />
            Lookup failure
          </label>
          <label>
            <input
              type="checkbox"
              checked={initial}
              onChange={event => setInitial(event.target.checked)}
            />
            Initially open
          </label>
          <label>
            <input
              type="checkbox"
              checked={off}
              onChange={event => setOff(event.target.checked)}
            />
            Motion off
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <MultiSelectExample
          key={String(empty) + String(initial)}
          task={task}
          dir={dir}
          disabled={disabled}
          controlSize={size}
          readOnly={readOnly}
          initialValues={empty ? [] : undefined}
          loading={loading}
          fail={fail}
          initialOpen={initial}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
