'use client'

import { DateRangePicker, Field } from '@cognitap/radiant'

export function ReserveFestivalPass() {
  return (
    <Field
      layout="group"
      label="Festival pass"
      description="The venue is closed April 8."
    >
      <DateRangePicker
        startLabel="First day"
        endLabel="Last day"
        calendarLabel="Choose festival dates"
        today="2028-04-01"
        min="2028-04-03"
        max="2028-04-14"
        isDateDisabled={date => date === '2028-04-08'}
        presets={[
          { label: 'Opening days', start: '2028-04-03', end: '2028-04-06' },
          { label: 'Full run', start: '2028-04-03', end: '2028-04-14' },
          { label: 'Closing days', start: '2028-04-11', end: '2028-04-14' }
        ]}
      />
    </Field>
  )
}
