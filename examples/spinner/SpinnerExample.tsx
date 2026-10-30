'use client'

import { Spinner, Alert, AlertDescription } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function SpinnerExample({
  loaded = false,
  standalone = false,
  motionOff = false
}: {
  loaded?: boolean
  standalone?: boolean
  motionOff?: boolean
}) {
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
  )
}
