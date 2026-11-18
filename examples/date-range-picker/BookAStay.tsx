'use client'

import { useState } from 'react'
import { Button, DateRangePicker } from '@cognitap/radiant'

export function BookAStay() {
  const [receipt, setReceipt] = useState('')
  return (
    <form
      className="grid justify-items-start gap-3"
      onSubmit={event => {
        event.preventDefault()
        const dates = new FormData(event.currentTarget)
        setReceipt(`${dates.get('arrival')} through ${dates.get('departure')}`)
      }}
      onReset={() => setReceipt('')}
    >
      <DateRangePicker
        startLabel="Arrival"
        endLabel="Departure"
        startName="arrival"
        endName="departure"
        locale="en-US"
        calendarLabel="Choose stay dates"
        today="2028-03-01"
        min="2028-03-01"
        max="2028-05-31"
        defaultFocusedDate="2028-04-03"
        required
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Confirm stay</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Clear dates
        </Button>
      </div>
      <output aria-live="polite">{receipt}</output>
    </form>
  )
}
