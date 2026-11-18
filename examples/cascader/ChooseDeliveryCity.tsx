'use client'
import { Cascader, Field } from '@cognitap/radiant'

const destinations = [
  {
    value: 'europe',
    label: 'Europe',
    children: [
      {
        value: 'hungary',
        label: 'Hungary',
        children: [
          { value: 'budapest', label: 'Budapest' },
          { value: 'szeged', label: 'Szeged' }
        ]
      }
    ]
  }
]
export function ChooseDeliveryCity() {
  return (
    <Field
      label="Delivery city"
      className="w-full max-w-sm"
    >
      <Cascader
        items={destinations}
        columnLabels={['Continent', 'Country', 'City']}
      />
    </Field>
  )
}
