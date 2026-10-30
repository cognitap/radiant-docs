'use client'
import { useState } from 'react'
import { Spinner, Alert, AlertDescription } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
export function SpinnerExample() {
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
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            width: '100%',
            maxWidth: '32rem'
          }}
        >
          <section
            aria-label="Account details"
            aria-busy={!loaded}
            style={{ minHeight: '5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}
          >
            {loaded ? (
              <p>Account: Jordan Rivera. Email preferences are ready.</p>
            ) : (
              <>
                <Spinner
                  label={standalone ? 'Loading account' : undefined}
                  motion={motionOff ? 'off' : 'inherit'}
                />
                {!standalone && <span>Loading account…</span>}
              </>
            )}
          </section>
          <Alert
            announce="polite"
            aria-label="Account result"
            style={loaded ? undefined : { padding: 0, borderWidth: 0 }}
          >
            {loaded && <AlertDescription>Account loaded.</AlertDescription>}
          </Alert>
        </div>
      </DemoPreview>
    </>
  )
}
