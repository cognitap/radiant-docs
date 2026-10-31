'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TagExample, type TagTask } from './TagExample'
export function TagPlayground({ task }: { task?: TagTask }) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [tone, setTone] = useState<'accent' | 'neutral' | 'warning' | 'danger'>('neutral'),
    [pending, setPending] = useState(false)
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
            label="Tone"
            value={tone}
            options={['accent', 'neutral', 'warning', 'danger']}
            onChange={setTone}
          />
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Disabled"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          <Checkbox
            label="Pending"
            checked={pending}
            onChange={event => setPending(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <TagExample
          key={''}
          task={task}
          dir={dir}
          disabled={disabled}
          tone={tone}
          pending={pending}
        />
      </DemoPreview>
    </>
  )
}
