'use client'
import { useState } from 'react'
import { Button, Switch, type ControlSize } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function WorkspacePreferences({ controlSize }: { controlSize?: ControlSize }) {
  const [quiet, setQuiet] = useState(false)
  const [message, setMessage] = useState('No changes saved.')
  return (
    <form
      aria-label="Workspace preferences"
      style={{ display: 'grid', gap: '1rem', maxWidth: '24rem', minWidth: 0 }}
      onReset={() => {
        setQuiet(false)
        setMessage('Preferences reset.')
      }}
      onSubmit={event => {
        event.preventDefault()
        const values = new FormData(event.currentTarget)
        setMessage(
          `Saved: do not disturb ${values.has('quiet') ? 'on' : 'off'}, desktop notifications ${values.has('desktop') ? 'on' : 'off'}.`
        )
      }}
    >
      <Switch
        label="Do not disturb"
        name="quiet"
        value="enabled"
        checked={quiet}
        onChange={event => setQuiet(event.target.checked)}
        controlSize={controlSize}
      />
      <Switch
        label="Desktop notifications"
        name="desktop"
        value="enabled"
        defaultChecked
        controlSize={controlSize}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
        <Button type="submit">Save preferences</Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
        >
          Reset
        </Button>
      </div>
      <output style={{ overflowWrap: 'anywhere' }}>{message}</output>
    </form>
  )
}
