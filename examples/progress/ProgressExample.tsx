'use client'

import { useId } from 'react'
import { Progress, Alert, AlertDescription } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function ProgressExample({
  value = 0,
  unknown = false
}: {
  value?: number
  unknown?: boolean
}) {
  const id = useId()
  const complete = !unknown && value === 100

  return (
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
  )
}
