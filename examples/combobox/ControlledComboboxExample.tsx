'use client'

import { useState } from 'react'
import { Button, Combobox, Field } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import { cityOptions } from './cities'

export function ComboboxControlledExample() {
  const ready = useHydrated()
  const [city, setCity] = useState<string | null>('oslo')
  const label = cityOptions.find(item => item.value === city)?.label
  return (
    <div style={{ display: 'grid', width: '20rem', maxWidth: '100%', gap: '1rem' }}>
      <Field label="Meeting city">
        <Combobox
          items={cityOptions}
          disabled={!ready}
          value={city}
          onValueChange={setCity}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.75rem' }}>
        <Button
          disabled={!ready || city === null}
          variant="outline"
          tone="neutral"
          onClick={() => setCity(null)}
        >
          Clear city
        </Button>
        <output>Meeting in: {label ?? 'Not chosen'}</output>
      </div>
    </div>
  )
}
