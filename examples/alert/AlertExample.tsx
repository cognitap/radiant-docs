'use client'
import { useState } from 'react'
import { Alert, AlertTitle, AlertDescription, Button, type AlertProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const stack = { display: 'grid', gap: '1rem', width: '100%', maxWidth: '34rem' } as const
const row = { display: 'flex', flexWrap: 'wrap', gap: '.5rem' } as const
const empty = { padding: 0, borderWidth: 0 } as const
export function Maintenance({ tone, announce }: Pick<AlertProps, 'tone' | 'announce'>) {
  return (
    <Alert
      tone={tone}
      announce={announce}
    >
      <AlertTitle level={3}>Scheduled maintenance</AlertTitle>
      <AlertDescription>Publishing pauses on Sunday from 02:00 to 03:00 UTC.</AlertDescription>
    </Alert>
  )
}
export function Tones() {
  return (
    <div style={stack}>
      <Alert>
        <AlertTitle level={3}>Scheduled maintenance</AlertTitle>
        <AlertDescription>Publishing pauses on Sunday from 02:00 to 03:00 UTC.</AlertDescription>
      </Alert>
      <Alert tone="accent">
        <AlertTitle level={3}>Draft saved</AlertTitle>
        <AlertDescription>Your latest changes are stored.</AlertDescription>
      </Alert>
      <Alert tone="warning">
        <AlertTitle level={3}>Connection interrupted</AlertTitle>
        <AlertDescription>Your changes remain on this device until you reconnect.</AlertDescription>
      </Alert>
      <Alert tone="danger">
        <AlertTitle level={3}>Save failed</AlertTitle>
        <AlertDescription>Try again when your connection returns.</AlertDescription>
      </Alert>
    </div>
  )
}
export function RenewPlan() {
  const [renewed, setRenewed] = useState(false)
  return (
    <Alert
      tone="warning"
      aria-labelledby="renew-plan-title"
      style={{ maxWidth: '34rem' }}
    >
      <AlertTitle
        id="renew-plan-title"
        level={3}
      >
        Your plan ends in 3 days
      </AlertTitle>
      <AlertDescription>
        {renewed
          ? 'Your plan renews on the next billing date.'
          : 'Renew now to keep access to shared workspaces.'}
      </AlertDescription>
      <div style={row}>
        <Button
          tone="warning"
          disabled={renewed}
          onClick={() => setRenewed(true)}
        >
          Renew plan
        </Button>
        <Button
          variant="ghost"
          tone="neutral"
        >
          Compare plans
        </Button>
      </div>
    </Alert>
  )
}
export function SaveFeedback({ failed = false, urgent = false }) {
  const [saved, setSaved] = useState(false)
  return (
    <div style={stack}>
      <Alert>
        <AlertTitle level={3}>Private draft</AlertTitle>
        <AlertDescription>Only you can see this draft until you publish it.</AlertDescription>
      </Alert>
      <div style={row}>
        <Button onClick={() => setSaved(true)}>Save draft</Button>
      </div>
      <Alert
        announce="polite"
        tone={failed ? 'danger' : 'accent'}
        aria-label="Save result"
        style={failed || saved ? undefined : empty}
      >
        {failed ? (
          <>
            <AlertTitle level={3}>Save failed</AlertTitle>
            <AlertDescription>Your draft is still here. Try saving again.</AlertDescription>
          </>
        ) : (
          saved && (
            <>
              <AlertTitle level={3}>Draft saved locally</AlertTitle>
              <AlertDescription>You can keep editing.</AlertDescription>
            </>
          )
        )}
      </Alert>
      <Alert
        announce="assertive"
        tone="warning"
        aria-label="Urgent example"
        style={urgent ? undefined : empty}
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
