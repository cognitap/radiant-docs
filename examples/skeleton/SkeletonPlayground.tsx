'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { SkeletonExample } from './SkeletonExample'

export function SkeletonPlayground() {
  const [loaded, setLoaded] = useState(false)
  const [motionOff, setMotionOff] = useState(false)

  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={motionOff}
            onChange={event => setMotionOff(event.target.checked)}
          />{' '}
          Disable placeholder motion
        </label>
        <button
          type="button"
          onClick={() => setLoaded(value => !value)}
        >
          {loaded ? 'Reload account' : 'Simulate account loaded'}
        </button>
      </DemoControls>
      <DemoPreview>
        <SkeletonExample
          loaded={loaded}
          motionOff={motionOff}
        />
      </DemoPreview>
    </>
  )
}
