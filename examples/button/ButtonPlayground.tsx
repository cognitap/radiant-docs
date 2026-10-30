'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type ButtonVariant, type Tone, type ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const ButtonExample = dynamic(() => import('./ButtonExample').then(module => module.ButtonExample))

export function ButtonPlayground({ defaultDisabled = false }: { defaultDisabled?: boolean }) {
  const [disabled, setDisabled] = useState(defaultDisabled)
  const [pending, setPending] = useState(false)
  const [variant, setVariant] = useState<ButtonVariant>('solid')
  const [tone, setTone] = useState<Tone>('accent')
  const [controlSize, setControlSize] = useState<ControlSize>('medium')

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
            onChange={setControlSize}
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
        </div>
      </DemoControls>
      <DemoPreview>
        <ButtonExample
          disabled={disabled}
          pending={pending}
          variant={variant}
          tone={tone}
          controlSize={controlSize}
        />
      </DemoPreview>
    </>
  )
}
