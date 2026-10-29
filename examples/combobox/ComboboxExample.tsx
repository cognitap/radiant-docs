'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Combobox,
  Field
} from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import { cityOptions } from './cities'

export function ComboboxTravelExample() {
  const ready = useHydrated()
  const [feedback, setFeedback] = useState('Your next chapter starts somewhere.')
  return (
    <Card style={{ width: '28rem', maxWidth: '100%', minWidth: 0 }}>
      <CardHeader>
        <CardTitle>A change of scenery</CardTitle>
        <CardDescription>Find a place for the next team gathering.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          aria-label="Team gathering"
          style={{ display: 'grid', gap: '1.5rem' }}
          onSubmit={event => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            setFeedback(`Destination saved: ${data.get('city')}.`)
          }}
          onReset={() => setFeedback('Destination reset.')}
        >
          <Field
            label="Destination"
            description="Search for a city, then choose a result."
            required
          >
            <Combobox
              items={cityOptions}
              disabled={!ready}
              name="city"
              defaultValue="budapest"
            />
          </Field>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              type="submit"
              disabled={!ready}
            >
              Save destination
            </Button>
            <Button
              type="reset"
              disabled={!ready}
              variant="outline"
              tone="neutral"
            >
              Reset
            </Button>
          </div>
          <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
        </form>
      </CardContent>
    </Card>
  )
}
