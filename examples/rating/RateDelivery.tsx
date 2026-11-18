'use client'

import { Rating } from '@cognitap/radiant'

export function RateDelivery() {
  return (
    <Rating
      label="Delivery experience"
      defaultValue={3}
    />
  )
}
