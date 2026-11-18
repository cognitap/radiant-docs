'use client'

import { Calendar } from '@cognitap/radiant'

export function ReviewDate() {
  return (
    <Calendar
      aria-label="Review date"
      today="2028-03-06"
      defaultValue="2028-03-09"
    />
  )
}
