'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import type { ButtonProps } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ButtonExample, type ButtonTask } from './ButtonExample'
export function ButtonPlayground({ task = 'save' }: { task?: ButtonTask }) {
  const [disabled, setDisabled] = useState(false),
    [pending, setPending] = useState(false),
    [variant, setVariant] = useState<NonNullable<ButtonProps['variant']>>(
      task === 'save' ? 'solid' : task === 'bookmark' ? 'soft' : 'outline'
    ),
    [tone, setTone] = useState<NonNullable<ButtonProps['tone']>>('accent'),
    [controlSize, setSize] = useState<NonNullable<ButtonProps['controlSize']>>('medium'),
    [off, setOff] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Variant"
            value={variant}
            options={['solid', 'soft', 'outline', 'ghost']}
            onChange={setVariant}
          />
          <SelectControl
            label="Tone"
            value={tone}
            options={['accent', 'neutral', 'warning', 'danger']}
            onChange={setTone}
          />
          <SelectControl
            label="Control size"
            value={controlSize}
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
            label="Pending"
            checked={pending}
            onChange={event => setPending(event.target.checked)}
          />
          <Checkbox
            label="Motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <ButtonExample
          task={task}
          disabled={disabled}
          pending={pending}
          variant={variant}
          tone={tone}
          controlSize={controlSize}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
