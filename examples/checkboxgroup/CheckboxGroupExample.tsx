'use client'
import { useState } from 'react'
import { CheckboxGroup, Button, type CheckboxGroupItem } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type CheckboxGroupTask = 'channels' | 'available' | 'save' | 'required'
const items: CheckboxGroupItem[] = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text messages' },
  { value: 'push', label: 'Push notifications' }
]
const labels: Record<CheckboxGroupTask, string> = {
  channels: 'Notifications',
  available: 'Available channels',
  save: 'Saved preferences',
  required: 'Incident alerts'
}
export function CheckboxGroupExample({ task = 'channels' }: { task?: CheckboxGroupTask }) {
  const [value, setValue] = useState<string[]>(['email'])
  const [result, setResult] = useState('')
  const saving = task === 'save',
    available = task === 'available',
    submits = saving || task === 'required'
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: '24rem', maxWidth: '100%' }}
      onSubmit={event => {
        event.preventDefault()
        setResult(new FormData(event.currentTarget).getAll('channels').join(', '))
      }}
      onReset={() => {
        setValue(['email'])
        setResult('')
      }}
    >
      <CheckboxGroup
        label={labels[task]}
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
          : {
              defaultValue: task === 'required' ? [] : available ? ['email', 'managed'] : ['email']
            })}
        selectAll={available || saving ? { label: 'Select all available' } : undefined}
        required={task === 'required'}
        description={
          task === 'required'
            ? 'Choose at least one way to reach you.'
            : 'Choose how we contact you.'
        }
        error={saving && value.length === 0 ? 'Choose at least one channel.' : undefined}
      />
      {submits ? <Button type="submit">Save preferences</Button> : null}
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
