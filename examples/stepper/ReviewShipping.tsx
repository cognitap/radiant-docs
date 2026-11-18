'use client'
import { Stepper } from '@cognitap/radiant'

export function ReviewShipping() {
  return (
    <Stepper
      aria-label="Shipping steps"
      controlSize="small"
      defaultValue="address"
      className="w-full max-w-lg"
      steps={[
        { value: 'address', label: 'Address' },
        { value: 'delivery', label: 'Delivery' },
        { value: 'review', label: 'Review' }
      ]}
    />
  )
}
