'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const ButtonExample = dynamic(() => import('./ButtonExample').then(module => module.ButtonExample))

export function ButtonPlayground({ defaultDisabled = false }: { defaultDisabled?: boolean }) {
  const [disabled, setDisabled] = useState(defaultDisabled)

  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          Disabled
        </label>
      </DemoControls>
      <DemoPreview>
        <ButtonExample disabled={disabled} />
      </DemoPreview>
    </>
  )
}
