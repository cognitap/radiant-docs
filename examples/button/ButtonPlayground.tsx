'use client'
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
              checked={pending}
              onChange={event => setPending(event.target.checked)}
            />
            Pending
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
