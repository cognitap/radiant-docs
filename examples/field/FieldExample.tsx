'use client'
import { useId, useRef, useState } from 'react'
import { Button, Checkbox, Field, Input, type ControlSize } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export type FieldTaskOptions = { controlSize?: ControlSize }

const taken = ['ada', 'admin', 'support']

export function ClaimUsername({ controlSize }: FieldTaskOptions) {
  const summaryId = useId(),
    input = useRef<HTMLInputElement>(null),
    [username, setUsername] = useState('ada'),
    [rejected, setRejected] = useState(''),
    [message, setMessage] = useState('Nothing has been sent.')
  return (
    <form
      aria-label="Claim a username"
      noValidate
      style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '24rem', minWidth: 0 }}
      onSubmit={event => {
        event.preventDefault()
        const name = username.trim().toLowerCase()
        if (taken.includes(name)) {
          setRejected(`The server rejected “${name}”: that username is taken.`)
          setMessage('')
          input.current?.focus()
          return
        }
        setRejected('')
        setMessage(`Claimed “${name}”.`)
      }}
    >
      {rejected && (
        <div
          id={summaryId}
          role="alert"
          style={{
            padding: '.75rem',
            border: '1px solid var(--rad-color-invalid)',
            borderRadius: 'var(--rad-control-radius)'
          }}
        >
          {rejected}
        </div>
      )}
      <Field
        label="Username"
        description="Lowercase letters and numbers."
        aria-invalid={rejected !== ''}
        aria-describedby={rejected ? summaryId : undefined}
      >
        <Input
          ref={input}
          name="username"
          value={username}
          controlSize={controlSize}
          autoComplete="username"
          onChange={event => setUsername(event.target.value)}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          controlSize={controlSize}
        >
          Claim username
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

const reminders = ['A day before', 'An hour before', 'At the start']

export function ScheduleReminders({ controlSize }: FieldTaskOptions) {
  const [chosen, setChosen] = useState<string[]>(['A day before']),
    [paused, setPaused] = useState(false),
    [message, setMessage] = useState('Nothing has been saved.'),
    error = !paused && chosen.length === 0 ? 'Choose at least one reminder, or pause them.' : ''
  return (
    <form
      aria-label="Session reminders"
      noValidate
      style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '24rem', minWidth: 0 }}
      onSubmit={event => {
        event.preventDefault()
        if (error) return
        const data = new FormData(event.currentTarget).getAll('reminders')
        setMessage(paused ? 'Reminders paused.' : `Saved: ${data.join(', ')}.`)
      }}
    >
      <Checkbox
        label="Pause reminders"
        checked={paused}
        controlSize={controlSize}
        onChange={event => setPaused(event.target.checked)}
      />
      <Field
        layout="group"
        label="Reminders"
        description="Each one arrives by email."
        required
        disabled={paused}
        error={error}
      >
        {reminders.map(label => (
          <Checkbox
            key={label}
            label={label}
            name="reminders"
            value={label}
            controlSize={controlSize}
            checked={chosen.includes(label)}
            onChange={event =>
              setChosen(values =>
                event.target.checked ? [...values, label] : values.filter(value => value !== label)
              )
            }
          />
        ))}
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          controlSize={controlSize}
        >
          Save reminders
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

export type FieldTask = 'username' | 'reminders'
export function FieldExample({
  task = 'username',
  ...options
}: FieldTaskOptions & { task?: FieldTask }) {
  return task === 'reminders' ? <ScheduleReminders {...options} /> : <ClaimUsername {...options} />
}
