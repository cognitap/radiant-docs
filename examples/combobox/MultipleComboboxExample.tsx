'use client'

import { useState } from 'react'
import { Button, Combobox, Field } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import { cityOptions } from './cities'

export function ComboboxMultipleExample() {
  const ready = useHydrated()
  const [feedback, setFeedback] = useState('Nothing submitted yet.')
  return (
    <form
      aria-label="Tour shortlist"
      style={{ display: 'grid', width: '24rem', maxWidth: '100%', gap: '1rem' }}
      onSubmit={event => {
        event.preventDefault()
        const cities = new FormData(event.currentTarget).getAll('cities')
        setFeedback(`Submitted: ${cities.join(', ') || 'none'}.`)
      }}
    >
      <Field
        label="Tour cities"
        description="Choose every city on the tour."
      >
        <Combobox
          type="multiple"
          items={cityOptions}
          disabled={!ready}
          name="cities"
          defaultValue={['berlin', 'vienna']}
        />
      </Field>
      <Button
        type="submit"
        disabled={!ready}
        style={{ justifySelf: 'start' }}
      >
        Save shortlist
      </Button>
      <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
    </form>
  )
}
