'use client'
import { useId, useState } from 'react'
import { Progress, Alert, AlertDescription } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
export function ProgressExample() {
  const [value, setValue] = useState(0)
  const [unknown, setUnknown] = useState(false)
  const id = useId()
  const complete = !unknown && value === 100
  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={unknown}
            onChange={event => setUnknown(event.target.checked)}
          />{' '}
          Unknown remaining amount
        </label>
        <button
          type="button"
          disabled={complete || unknown}
          onClick={() => setValue(number => Math.min(100, number + 25))}
        >
          Advance export
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(0)
            setUnknown(false)
          }}
        >
          Reset export
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
            aria-label="Export package"
            aria-busy={!complete}
            style={{ display: 'grid', gap: '1rem' }}
          >
            <label htmlFor={id}>Export progress</label>
            <Progress
              id={id}
              value={unknown ? null : value}
            />
            <p>
              {unknown
                ? 'Preparing the export. The remaining amount is unknown.'
                : `${value} of 100 items prepared.`}
            </p>
          </section>
          <Alert
            announce="polite"
            tone="accent"
            aria-label="Export result"
            style={complete ? undefined : { padding: 0, borderWidth: 0 }}
          >
            {complete && <AlertDescription>Export complete.</AlertDescription>}
          </Alert>
        </div>
      </DemoPreview>
    </>
  )
}
