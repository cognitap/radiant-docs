'use client'
import { useState } from 'react'
import { Skeleton, Alert, AlertDescription } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
export function SkeletonExample() {
  const [loaded, setLoaded] = useState(false)
  const [motionOff, setMotionOff] = useState(false)
  const motion = motionOff ? 'off' : 'inherit'
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
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            padding: '1rem',
            width: '100%',
            maxWidth: '32rem',
            boxSizing: 'border-box'
          }}
        >
          <section
            aria-label="Account details"
            aria-busy={!loaded}
            style={{ minHeight: '10rem', display: 'grid', alignContent: 'center', gap: '1rem' }}
          >
            {loaded ? (
              <>
                <h3>Jordan Rivera</h3>
                <p>Email: jordan@example.com</p>
                <p>Weekly product updates are enabled.</p>
              </>
            ) : (
              <>
                <Skeleton
                  motion={motion}
                  style={{ width: '4rem', height: '4rem', borderRadius: '50%' }}
                />
                <Skeleton
                  motion={motion}
                  style={{ width: '70%' }}
                />
                <Skeleton motion={motion} />
                <Skeleton
                  motion={motion}
                  style={{ width: '55%' }}
                />
              </>
            )}
          </section>
          <Alert
            announce="polite"
            aria-label="Account loading status"
          >
            <AlertDescription>{loaded ? 'Account loaded.' : 'Loading account…'}</AlertDescription>
          </Alert>
        </div>
      </DemoPreview>
    </>
  )
}
