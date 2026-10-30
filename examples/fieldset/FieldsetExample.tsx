'use client'
import { useState } from 'react'
import { Fieldset, Field, Input, Button } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type FieldsetTask = 'shipping' | 'locked' | 'validation'
export function FieldsetExample({ task = 'shipping' }: { task?: FieldsetTask }) {
  const contact = task === 'validation'
  const [locked, setLocked] = useState(task === 'locked')
  const [invalid, setInvalid] = useState(false)
  const [result, setResult] = useState('')
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: '24rem', maxWidth: '100%' }}
      onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const missing =
          contact &&
          !String(data.get('email') ?? '').trim() &&
          !String(data.get('phone') ?? '').trim()
        setInvalid(missing)
        setResult(missing ? '' : contact ? 'Contact details accepted' : 'Address accepted')
      }}
      onReset={() => {
        setInvalid(false)
        setResult('')
      }}
    >
      {task === 'locked' ? (
        <Button
          variant="outline"
          onClick={() => setLocked(!locked)}
        >
          {locked ? 'Unlock address' : 'Lock address'}
        </Button>
      ) : null}
      <Fieldset
        legend={
          contact ? 'Contact details' : task === 'locked' ? 'Saved address' : 'Shipping address'
        }
        disabled={locked}
        description={
          contact
            ? 'Enter an email address or a phone number.'
            : 'Where should we deliver your order?'
        }
        error={invalid ? 'Enter at least one contact method.' : undefined}
      >
        {contact ? (
          <>
            <Field label="Email">
              <Input
                type="email"
                name="email"
                autoComplete="email"
              />
            </Field>
            <Field label="Phone">
              <Input
                type="tel"
                name="phone"
                autoComplete="tel"
              />
            </Field>
          </>
        ) : (
          <>
            <Field
              label="Street"
              required
            >
              <Input
                name="street"
                autoComplete="shipping street-address"
                defaultValue="10 Main St"
              />
            </Field>
            <Field label="City">
              <Input
                name="city"
                autoComplete="shipping address-level2"
                defaultValue="Budapest"
              />
            </Field>
          </>
        )}
        <Button
          type="submit"
          variant="soft"
        >
          {contact ? 'Check contact details' : 'Use address'}
        </Button>
      </Fieldset>
      <Button
        type="reset"
        variant="ghost"
      >
        Reset fields
      </Button>
      <output
        aria-label={contact ? 'Contact result' : 'Address result'}
        aria-live="polite"
      >
        {result}
      </output>
    </form>
  )
}
