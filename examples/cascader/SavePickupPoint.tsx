'use client'
import { useState } from 'react'
import { Button, Cascader, Field } from '@cognitap/radiant'

const points = [
  {
    value: 'north',
    label: 'North district',
    children: [
      { value: 'station', label: 'Station' },
      { value: 'market', label: 'Market' }
    ]
  }
]
export function SavePickupPoint() {
  const [place, setPlace] = useState('')
  return (
    <div className="grid w-full max-w-sm gap-3">
      <form
        className="grid gap-2"
        onSubmit={event => {
          event.preventDefault()
          setPlace(String(new FormData(event.currentTarget).get('pickup')))
        }}
      >
        <Field
          label="Pickup point"
          required
        >
          <Cascader
            items={points}
            defaultValue="station"
            name="pickup"
          />
        </Field>
        <Button type="submit">Save pickup point</Button>
      </form>
      <output className="text-sm">{place && 'Saved ' + place}</output>
    </div>
  )
}
