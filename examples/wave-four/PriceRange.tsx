'use client'

import { useState } from 'react'
import {
  Button,
  Field,
  NumberFormatter,
  RangeSlider,
  type RangeSliderValue
} from '@cognitap/radiant'

const startingPrice: RangeSliderValue = [60, 180]

export function PriceRange() {
  const [price, setPrice] = useState(startingPrice)
  const [submitted, setSubmitted] = useState<string[] | null>(null)
  return (
    <form
      style={{ display: 'grid', gap: '.75rem', width: '100%', maxWidth: '24rem' }}
      onSubmit={event => {
        event.preventDefault()
        setSubmitted(new FormData(event.currentTarget).getAll('price').map(String))
      }}
      onReset={() => {
        setPrice(startingPrice)
        setSubmitted(null)
      }}
    >
      <Field
        label="Nightly rate"
        description="Choose the lowest and highest rate in US dollars."
      >
        <RangeSlider
          lowerLabel="Minimum nightly rate"
          upperLabel="Maximum nightly rate"
          name="price"
          min={20}
          max={300}
          step={5}
          value={price}
          onValueChange={setPrice}
        />
      </Field>
      <p>
        <NumberFormatter
          value={price[0]}
          options={{ style: 'currency', currency: 'USD' }}
        />{' '}
        to{' '}
        <NumberFormatter
          value={price[1]}
          options={{ style: 'currency', currency: 'USD' }}
        />
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button type="submit">Apply price range</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset price range
        </Button>
      </div>
      <output aria-live="polite">
        {submitted && new URLSearchParams(submitted.map(value => ['price', value])).toString()}
      </output>
    </form>
  )
}
