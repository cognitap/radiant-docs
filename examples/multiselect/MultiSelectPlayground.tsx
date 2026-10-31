'use client'
import { Checkbox } from '@cognitap/radiant'
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
            label="Initially empty"
            checked={empty}
            onChange={event => setEmpty(event.target.checked)}
          />
          <Checkbox
            label="Loading"
            checked={loading}
            onChange={event => setLoading(event.target.checked)}
          />
          <Checkbox
            label="Lookup failure"
            checked={fail}
            onChange={event => setFail(event.target.checked)}
          />
          <Checkbox
            label="Initially open"
            checked={initial}
            onChange={event => setInitial(event.target.checked)}
          />
          <Checkbox
            label="Motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
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
