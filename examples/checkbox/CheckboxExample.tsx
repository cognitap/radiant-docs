'use client'
import { useState } from 'react'
import { Button, Checkbox, Field, type ControlSize } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

const formStyle = { display: 'grid', gap: '1rem', maxWidth: '24rem', minWidth: 0 }

export function ChooseNotificationChannels({ controlSize }: { controlSize?: ControlSize }) {
  const [message, setMessage] = useState('Email is on by default.')
  return (
    <form
      aria-label="Notification channels"
      style={formStyle}
      onReset={() => setMessage('Back to email only.')}
      onSubmit={event => {
        event.preventDefault()
        const channels = new FormData(event.currentTarget).getAll('channels')
        setMessage(`Saved: ${channels.join(', ') || 'no channels'}.`)
      }}
    >
      <Field
        layout="group"
        label="Notify me by"
      >
        <Checkbox
          label="Email"
          name="channels"
          value="email"
          defaultChecked
          controlSize={controlSize}
        />
        <Checkbox
          label="Text message"
          name="channels"
          value="sms"
          controlSize={controlSize}
        />
        <Checkbox
          label="Push notification"
          name="channels"
          value="push"
          controlSize={controlSize}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
        <Button type="submit">Save</Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
        >
          Reset
        </Button>
      </div>
      <output>{message}</output>
    </form>
  )
}

export function RequireConsent({ controlSize }: { controlSize?: ControlSize }) {
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  return (
    <form
      aria-label="Create account"
      noValidate
      style={formStyle}
      onReset={() => {
        setError('')
        setMessage('')
      }}
      onSubmit={event => {
        event.preventDefault()
        const accepted = new FormData(event.currentTarget).has('terms')
        setError(accepted ? '' : 'Accept the terms to continue.')
        setMessage(accepted ? 'Account created.' : '')
      }}
    >
      <Field
        label="I accept the terms of service"
        description="You can download a copy after signing up."
        required
        error={error}
      >
        <Checkbox
          name="terms"
          value="accepted"
          controlSize={controlSize}
          onChange={event => {
            if (event.target.checked) setError('')
          }}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
        <Button type="submit">Create account</Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
        >
          Reset
        </Button>
      </div>
      <output>{message}</output>
    </form>
  )
}
