'use client'

import { useState } from 'react'
import { Alert, AlertTitle, AlertDescription, Button } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export type SaveResult = 'saved' | 'error' | null

/** Owns the save result unless a parent passes `result` and `onResultChange`. */
export function AlertExample({
  result: controlled,
  urgent = false,
  onResultChange
}: {
  result?: SaveResult
  urgent?: boolean
  onResultChange?: (result: SaveResult) => void
}) {
  const [own, setOwn] = useState<SaveResult>(null)
  const result = controlled === undefined ? own : controlled
  const setResult = onResultChange ?? setOwn
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '34rem' }}>
      <Alert>
        <AlertTitle level={3}>Private draft</AlertTitle>
        <AlertDescription>Only you can see this draft until you publish it.</AlertDescription>
      </Alert>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button onClick={() => setResult('saved')}>Save draft</Button>
      </div>
      <Alert
        announce="polite"
        tone={result === 'error' ? 'danger' : 'accent'}
        aria-label="Save result"
        style={result ? undefined : { padding: 0, borderWidth: 0 }}
      >
        {result && (
          <>
            <AlertTitle level={3}>
              {result === 'saved' ? 'Draft saved locally' : 'Save failed'}
            </AlertTitle>
            <AlertDescription>
              {result === 'saved'
                ? 'You can keep editing.'
                : 'Your draft is still here. Try saving again.'}
            </AlertDescription>
          </>
        )}
      </Alert>
      <Alert
        announce="assertive"
        tone="warning"
        aria-label="Urgent example"
        style={urgent ? undefined : { padding: 0, borderWidth: 0 }}
      >
        {urgent && (
          <>
            <AlertTitle level={3}>Example interruption</AlertTitle>
            <AlertDescription>
              This simulated interruption needs attention. Your draft remains safe.
            </AlertDescription>
          </>
        )}
      </Alert>
    </div>
  )
}
