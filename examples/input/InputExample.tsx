'use client'
import { useEffect, useId, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  Field,
  Input,
  Radio,
  RadioGroup,
  type InputProps
} from '@cognitap/radiant'
export type InputTaskOptions = Pick<InputProps, 'controlSize' | 'dir' | 'className' | 'style'>
const formStyle = {
  display: 'grid',
  gap: '1rem',
  width: '100%',
  maxWidth: '26rem',
  minWidth: 0
} as const
function emailError(input: HTMLInputElement) {
  if (input.validity.valid) return ''
  return input.validity.valueMissing
    ? 'Enter your work email.'
    : 'Use a valid email address, such as ada@example.com.'
}
export function UpdateProfile(props: InputTaskOptions) {
  const email = useRef<HTMLInputElement>(null),
    timer = useRef<ReturnType<typeof setTimeout>>(undefined),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState('Your changes stay in this preview.')
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <form
      aria-label="Edit profile"
      noValidate
      style={formStyle}
      onSubmit={event => {
        event.preventDefault()
        const invalid = email.current ? emailError(email.current) : ''
        setError(invalid)
        if (invalid) {
          email.current?.focus()
          setMessage('Check the highlighted field, then save again.')
          return
        }
        const data = new FormData(event.currentTarget)
        setSaving(true)
        setMessage('Saving your profile…')
        timer.current = setTimeout(() => {
          setSaving(false)
          setMessage(`Saved ${String(data.get('displayName'))} · ${String(data.get('email'))}.`)
        }, 700)
      }}
      onReset={() => {
        setError('')
        setMessage('Draft reset.')
      }}
    >
      <Field label="Display name">
        <Input
          {...props}
          name="displayName"
          defaultValue="Ada Lovelace"
          autoComplete="name"
          readOnly={saving}
        />
      </Field>
      <Field
        label="Work email"
        description="Where your team can reach you."
        required
        error={error || undefined}
      >
        <Input
          {...props}
          ref={email}
          name="email"
          type="email"
          defaultValue="ada@example.com"
          autoComplete="email"
          readOnly={saving}
          onBlur={event => setError(emailError(event.currentTarget))}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          pending={saving}
        >
          Save profile
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={saving}
        >
          Reset draft
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function NameProject(props: InputTaskOptions) {
  const [name, setName] = useState('Reader study'),
    [touched, setTouched] = useState(false),
    [message, setMessage] = useState('Name the project your team will see.')
  const short = name.trim().length < 3
  return (
    <form
      aria-label="Name a project"
      noValidate
      style={formStyle}
      onSubmit={event => {
        event.preventDefault()
        setTouched(true)
        setMessage(short ? 'Use at least three characters.' : `Project renamed to ${name.trim()}.`)
      }}
      onReset={() => {
        setName('Reader study')
        setTouched(false)
        setMessage('Name restored.')
      }}
    >
      <Field
        label="Project name"
        description={`${name.length}/40 characters`}
        error={touched && short ? 'Use at least three characters.' : undefined}
      >
        <Input
          {...props}
          name="project"
          value={name}
          maxLength={40}
          onChange={event => setName(event.target.value)}
          onBlur={() => setTouched(true)}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button type="submit">Rename project</Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
        >
          Restore name
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function ConfirmSubmittedFields(props: InputTaskOptions) {
  const [message, setMessage] = useState('Submit to see which fields are sent.')
  return (
    <form
      aria-label="Transfer workspace"
      style={formStyle}
      onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setMessage(`Sent: ${[...data.keys()].join(', ')}.`)
      }}
    >
      <Field
        label="Workspace ID"
        description="Read-only: focusable and submitted."
      >
        <Input
          {...props}
          name="workspace"
          defaultValue="ws-4821"
          readOnly
        />
      </Field>
      <Field
        label="Billing code"
        description="Disabled: skipped by focus and left out of the form data."
        disabled
      >
        <Input
          {...props}
          name="billing"
          defaultValue="LEGACY-07"
        />
      </Field>
      <Field
        label="New owner email"
        required
      >
        <Input
          {...props}
          name="owner"
          type="email"
          defaultValue="grace@example.com"
          autoComplete="email"
        />
      </Field>
      <Button
        type="submit"
        style={{ justifySelf: 'start' }}
      >
        Transfer workspace
      </Button>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function MatchControlSizes({ controlSize: _controlSize, ...props }: InputTaskOptions) {
  const id = useId()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11rem), 1fr))',
        gap: '1.5rem',
        width: '100%',
        minWidth: 0
      }}
    >
      {(['small', 'medium', 'large'] as const).map(controlSize => (
        <div
          key={controlSize}
          style={{ display: 'grid', gap: '1rem', alignContent: 'start', minWidth: 0 }}
        >
          <Field label={`${controlSize} input`}>
            <Input
              {...props}
              defaultValue="Weekly digest"
              controlSize={controlSize}
            />
          </Field>
          <Checkbox
            label="Email me"
            controlSize={controlSize}
            defaultChecked
          />
          <RadioGroup
            label="Cadence"
            name={`${id}-${controlSize}`}
            defaultValue="weekly"
            controlSize={controlSize}
          >
            <Radio
              label="Weekly"
              value="weekly"
            />
            <Radio
              label="Monthly"
              value="monthly"
            />
          </RadioGroup>
        </div>
      ))}
    </div>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type InputTask = 'profile' | 'project' | 'submitted' | 'sizes'
export function InputExample({
  task = 'profile',
  ...props
}: InputTaskOptions & { task?: InputTask }) {
  return (
    <MotionProvider>
      {task === 'project' ? (
        <NameProject {...props} />
      ) : task === 'submitted' ? (
        <ConfirmSubmittedFields {...props} />
      ) : task === 'sizes' ? (
        <MatchControlSizes {...props} />
      ) : (
        <UpdateProfile {...props} />
      )}
    </MotionProvider>
  )
}
