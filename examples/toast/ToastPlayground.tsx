'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ToastExample } from './ToastExample'

export function ToastPlayground() {
  const [timed, setTimed] = useState(false)

  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={timed}
            onChange={event => setTimed(event.target.checked)}
          />{' '}
          Dismiss informational notifications after 6 seconds
        </label>
      </DemoControls>
      <DemoPreview>
        <ToastExample timed={timed} />
      </DemoPreview>
    </>
  )
}
