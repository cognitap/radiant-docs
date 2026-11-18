'use client'

import { DatePicker, Field } from '@cognitap/radiant'

export function InspectionDate() {
  return (
    <Field
      label="Inspection date"
      description="Inspections take place on weekdays in March and April."
    >
      <DatePicker
        calendarLabel="Choose an inspection date"
        today="2028-03-06"
        defaultFocusedDate="2028-04-03"
        min="2028-03-01"
        max="2028-04-30"
        isDateDisabled={date => [0, 6].includes(new Date(date).getUTCDay())}
      />
    </Field>
  )
}
