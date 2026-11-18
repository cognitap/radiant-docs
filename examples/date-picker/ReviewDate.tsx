'use client'

import { DatePicker, Field } from '@cognitap/radiant'

export function ReviewDate() {
  return (
    <Field label="Review date">
      <DatePicker
        defaultValue="2028-03-09"
        today="2028-03-06"
      />
    </Field>
  )
}
