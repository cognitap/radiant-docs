'use client'
import { useState } from 'react'
import { Button, Checkbox, Field, OTPField, type OTPFieldProps } from '@cognitap/radiant'
export type OTPTaskOptions = Pick<
  OTPFieldProps,
  'length' | 'mode' | 'disabled' | 'readOnly' | 'controlSize' | 'className' | 'style' | 'parts'
> & { dir?: 'ltr' | 'rtl'; initialValue?: string }
export function VerifyEmailCode({
  dir,
  initialValue = '',
  length = 6,
  mode = 'numeric',
  ...props
}: OTPTaskOptions) {
  const [message, setMessage] = useState('Enter the code from your email.')
  return (
    <form
      dir={dir}
      style={{ display: 'grid', gap: '1rem', maxWidth: '32rem' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(
          `Email verified with code ${new FormData(event.currentTarget).get('emailCode')}.`
        )
      }}
      onReset={() => setMessage('Enter the code from your email.')}
    >
      <Field
        label="Email verification code"
        description={`Enter the ${length}-character code from your message.`}
        required
      >
        <OTPField
          {...props}
          length={length}
          mode={mode}
          name="emailCode"
          defaultValue={initialValue}
        />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Verify email</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Start again
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function ApproveWorkspaceAccess({
  dir,
  initialValue = '',
  length = 8,
  mode = 'alphanumeric',
  ...props
}: OTPTaskOptions) {
  const [message, setMessage] = useState('Approve the temporary workspace access request.')
  return (
    <form
      dir={dir}
      style={{ display: 'grid', gap: '1rem', maxWidth: '32rem' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(
          `Access request approved using ${new FormData(event.currentTarget).get('approvalCode')}.`
        )
      }}
      onReset={() => setMessage('Approve the temporary workspace access request.')}
    >
      <p>Request: Sam Novak needs one hour of access to the research workspace.</p>
      <Field
        label="Temporary approval code"
        description={`Paste the ${length}-character code supplied by your workspace administrator.`}
        required
      >
        <OTPField
          {...props}
          length={length}
          mode={mode}
          name="approvalCode"
          defaultValue={initialValue}
        />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Approve access</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Clear request
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function ReviewRecoveryCode({
  dir,
  initialValue,
  length = 6,
  mode = 'numeric',
  ...props
}: OTPTaskOptions) {
  const prefix = (mode === 'numeric' ? '12' : 'AB').slice(0, length),
    initial = initialValue ?? prefix
  const [value, setValue] = useState(initial),
    [keep, setKeep] = useState(true),
    [message, setMessage] = useState('Check the recovery code before continuing.')
  return (
    <form
      dir={dir}
      style={{ display: 'grid', gap: '1rem', maxWidth: '32rem' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(
          `Recovery continued with ${new FormData(event.currentTarget).get('recoveryCode')}.`
        )
      }}
      onReset={() => {
        setValue(initial)
        setKeep(true)
        setMessage('Check the recovery code before continuing.')
      }}
    >
      <Checkbox
        label="Keep the account prefix"
        checked={keep}
        onChange={event => setKeep(event.target.checked)}
      />
      <Field
        label="Recovery code"
        description={`The account prefix is ${prefix}. Enter ${length} characters.`}
        required
      >
        <OTPField
          {...props}
          length={length}
          mode={mode}
          name="recoveryCode"
          value={value}
          onChange={event => {
            const next = event.target.value
            if (keep && !next.startsWith(prefix)) {
              setMessage('The account prefix is protected.')
              return
            }
            setValue(next)
            setMessage('Recovery code updated.')
          }}
        />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Continue recovery</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Restore account code
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

import '@cognitap/radiant/styles.css'
export type OTPFieldTask = 'email' | 'access' | 'recovery'
export function OTPFieldExample({
  task = 'email',
  ...options
}: OTPTaskOptions & { task?: OTPFieldTask }) {
  return task === 'access' ? (
    <ApproveWorkspaceAccess {...options} />
  ) : task === 'recovery' ? (
    <ReviewRecoveryCode {...options} />
  ) : (
    <VerifyEmailCode {...options} />
  )
}
