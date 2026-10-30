'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { SpinnerExample } from './SpinnerExample'

export function SpinnerPlayground() {
  const [loaded, setLoaded] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [motionOff, setMotionOff] = useState(false)

  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={standalone}
            onChange={event => setStandalone(event.target.checked)}
          />{' '}
          Standalone indicator
        </label>
        <label>
          <input
            type="checkbox"
            checked={motionOff}
            onChange={event => setMotionOff(event.target.checked)}
          />{' '}
          Disable indicator motion
        </label>
        <button
          type="button"
          disabled={loaded}
          onClick={() => setLoaded(true)}
        >
          Simulate account loaded
        </button>
        <button
          type="button"
          disabled={!loaded}
          onClick={() => setLoaded(false)}
        >
          Reload account
        </button>
      </DemoControls>
      <DemoPreview>
        <SpinnerExample
          loaded={loaded}
          standalone={standalone}
          motionOff={motionOff}
        />
      </DemoPreview>
    </>
  )
}
