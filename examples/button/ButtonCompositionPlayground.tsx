'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const ButtonComposition = dynamic(() =>
  import('./ButtonComposition').then(module => module.ButtonComposition)
)

export function ButtonCompositionPlayground() {
  const [pending, setPending] = useState(false)
  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={pending}
            onChange={event => setPending(event.target.checked)}
          />
          Pending
        </label>
      </DemoControls>
      <DemoPreview>
        <ButtonComposition pending={pending} />
      </DemoPreview>
    </>
  )
}
