'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TagsInputExample, type TagsInputTask } from './TagsInputExample'
export function TagsInputPlayground({ task }: { task?: TagsInputTask }) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [size, setSize] = useState<'small' | 'medium' | 'large'>('medium'),
    [readOnly, setReadOnly] = useState(false),
    [empty, setEmpty] = useState(false),
    [maximum, setMaximum] = useState(task === 'guests' ? '3' : '4'),
    [separator, setSeparator] = useState(task === 'guests' ? 'both' : ',')
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
          <SelectControl
            label="Maximum tags"
            value={maximum}
            options={['0', '1', '3', '4']}
            onChange={setMaximum}
          />
          <SelectControl
            label="Separator"
            value={separator}
            options={[',', ';', 'both']}
            onChange={setSeparator}
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
        </div>
      </DemoControls>
      <DemoPreview>
        <TagsInputExample
          key={String(empty)}
          task={task}
          dir={dir}
          disabled={disabled}
          controlSize={size}
          readOnly={readOnly}
          initialValues={empty ? [] : undefined}
          maxCount={Number(maximum)}
          separators={separator === 'both' ? [',', ';'] : [separator]}
        />
      </DemoPreview>
    </>
  )
}
