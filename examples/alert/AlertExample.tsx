'use client'
import { useState } from 'react'
import { Alert, AlertTitle, AlertDescription, Button } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
export function AlertExample() {
  const [result, setResult] = useState<'saved' | 'error' | null>(null)
  const [urgent, setUrgent] = useState(false)
  return (
    <>
      <DemoControls>
        <button
          type="button"
          onClick={() => setResult('error')}
        >
          Simulate connection error
        </button>
        <button
          type="button"
          onClick={() => setUrgent(true)}
        >
          Simulate urgent interruption
        </button>
      </DemoControls>
      <DemoPreview>
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
      </DemoPreview>
    </>
  )
}
