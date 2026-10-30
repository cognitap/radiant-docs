'use client'
import { useRef, useState } from 'react'
import {
  Button,
  Field,
  Input,
  NativeSelect,
  PasswordInput,
  type PasswordInputProps
} from '@cognitap/radiant'
export type PasswordInputTaskOptions = Pick<
  PasswordInputProps,
  | 'controlSize'
  | 'dir'
  | 'className'
  | 'style'
  | 'showLabel'
  | 'hideLabel'
  | 'readOnly'
  | 'disabled'
> & { invalid?: boolean; required?: boolean }
export function PrepareWorkspaceSignIn({
  invalid,
  disabled,
  required = true,
  ...props
}: PasswordInputTaskOptions) {
  const [message, setMessage] = useState('Enter your workspace credentials.')
  return (
    <form
      aria-label="Workspace sign in"
      style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '26rem', minWidth: 0 }}
      onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setMessage(`Sign-in request prepared for ${String(data.get('email'))}.`)
      }}
      onReset={() => setMessage('Credentials restored.')}
    >
      <Field
        label="Work email"
        required={required}
        disabled={disabled}
      >
        <Input
          name="email"
          type="email"
          autoComplete="username"
          defaultValue="researcher@example.com"
        />
      </Field>
      <Field
        label="Password"
        required={required}
        disabled={disabled}
        error={invalid ? 'Review your password.' : undefined}
        description="Use your current workspace password."
      >
        <PasswordInput
          {...props}
          name="password"
          autoComplete="current-password"
          defaultValue=""
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          disabled={disabled}
        >
          Prepare sign in
        </Button>
        <Button
          type="reset"
          variant="outline"
          disabled={disabled}
        >
          Restore credentials
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function ChooseWorkspacePassword({
  invalid,
  disabled,
  required = true,
  ...props
}: PasswordInputTaskOptions) {
  const [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [message, setMessage] = useState('Use at least twelve characters.'),
    confirm = useRef<HTMLInputElement>(null)
  const mismatch = confirmation !== '' && password !== confirmation
  return (
    <form
      aria-label="New workspace password"
      style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '26rem', minWidth: 0 }}
      onSubmit={event => {
        event.preventDefault()
        if (password !== confirmation) {
          setMessage('Passwords must match.')
          confirm.current?.focus()
          return
        }
        setMessage('New password request prepared.')
      }}
      onReset={event => {
        event.preventDefault()
        setPassword('')
        setConfirmation('')
        setMessage('New password fields cleared.')
      }}
    >
      <Field
        label="New password"
        required={required}
        disabled={disabled}
        description="At least twelve characters."
        error={invalid ? 'Review the new password.' : undefined}
      >
        <PasswordInput
          {...props}
          name="new-password"
          autoComplete="new-password"
          minLength={12}
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
      </Field>
      <Field
        label="Confirm new password"
        required={required}
        disabled={disabled}
        error={mismatch ? 'Passwords must match.' : undefined}
      >
        <PasswordInput
          {...props}
          ref={confirm}
          name="confirmation"
          autoComplete="new-password"
          minLength={12}
          value={confirmation}
          onChange={event => setConfirmation(event.target.value)}
          showLabel="Show confirmation"
          hideLabel="Hide confirmation"
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          disabled={disabled}
        >
          Prepare password change
        </Button>
        <Button
          type="reset"
          variant="outline"
          disabled={disabled}
        >
          Clear password fields
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
const connections = {
  reader: {
    name: 'Reader study',
    account: 'reader-demo',
    endpoint: 'https://reader.example.com',
    password: 'reader-demo-password'
  },
  component: {
    name: 'Component kit',
    account: 'component-demo',
    endpoint: 'https://components.example.com',
    password: 'component-demo-password'
  }
}
export function ReviewConnectionPassword({
  invalid,
  disabled,
  readOnly: _readOnly,
  required: _required,
  ...props
}: PasswordInputTaskOptions) {
  const [selected, setSelected] = useState<keyof typeof connections>('reader'),
    record = connections[selected]
  return (
    <section
      aria-label="Connection credentials"
      style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '26rem', minWidth: 0 }}
    >
      <Field
        label="Demo connection"
        disabled={disabled}
      >
        <NativeSelect
          value={selected}
          onChange={event => {
            if (event.target.value === 'reader' || event.target.value === 'component')
              setSelected(event.target.value)
          }}
        >
          <option value="reader">Reader study</option>
          <option value="component">Component kit</option>
        </NativeSelect>
      </Field>
      <p>{record.endpoint}</p>
      <p>Account: {record.account}</p>
      <Field
        label="Connection password"
        disabled={disabled}
        error={invalid ? 'Review the connection.' : undefined}
        description="Read-only credential for this demo connection."
      >
        <PasswordInput
          {...props}
          key={selected}
          readOnly
          value={record.password}
          autoComplete="current-password"
        />
      </Field>
    </section>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type PasswordInputTask = 'signin' | 'change' | 'review'
export function PasswordInputExample({
  task = 'signin',
  ...props
}: PasswordInputTaskOptions & { task?: PasswordInputTask }) {
  return (
    <MotionProvider>
      {task === 'change' ? (
        <ChooseWorkspacePassword {...props} />
      ) : task === 'review' ? (
        <ReviewConnectionPassword {...props} />
      ) : (
        <PrepareWorkspaceSignIn {...props} />
      )}
    </MotionProvider>
  )
}
