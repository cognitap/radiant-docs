'use client'
import { useState } from 'react'
import { CheckboxGroup, Button, type CheckboxGroupItem } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type CheckboxGroupTask = 'channels' | 'available' | 'save'
const items: CheckboxGroupItem[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text messages' },
  { value: 'push', label: 'Push notifications' }
]
export function CheckboxGroupExample({ task = 'channels' }: { task?: CheckboxGroupTask }) {
  const [value, setValue] = useState<string[]>(['email'])
  const [result, setResult] = useState('')
  const saving = task === 'save',
    available = task === 'available'
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: '24rem', maxWidth: '100%' }}
      onSubmit={event => {
        event.preventDefault()
        setResult(
          value.length ? new FormData(event.currentTarget).getAll('channels').join(', ') : ''
        )
      }}
      onReset={() => {
        setValue(['email'])
        setResult('')
      }}
    >
      <CheckboxGroup
        label={saving ? 'Saved preferences' : available ? 'Available channels' : 'Notifications'}
        name="channels"
        items={
          available
            ? [
                ...items,
                { value: 'managed', label: 'Managed by your organization', disabled: true }
              ]
            : items
        }
        {...(saving
          ? { value, onValueChange: setValue }
          : { defaultValue: available ? ['email', 'managed'] : ['email'] })}
        selectAll={task !== 'channels' ? { label: 'Select all available' } : undefined}
        description="Choose how we contact you."
        error={saving && value.length === 0 ? 'Choose at least one channel.' : undefined}
      />
      {saving ? <Button type="submit">Save preferences</Button> : null}
      <Button
        type="reset"
        variant="ghost"
      >
        Reset choices
      </Button>
      <output
        aria-label="Saved channels"
        aria-live="polite"
      >
        {result}
      </output>
    </form>
  )
}
