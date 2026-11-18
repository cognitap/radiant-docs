'use client'

import { Spoiler } from '@cognitap/radiant'

export function ReadShippingDetails() {
  return (
    <Spoiler
      maxHeight={120}
      className="max-w-sm"
    >
      <p>Dispatches in two business days.</p>
    </Spoiler>
  )
}
