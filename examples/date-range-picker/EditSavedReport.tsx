'use client'

import { useId, useState } from 'react'
import { Button, DateRangePicker } from '@cognitap/radiant'

export function EditSavedReport() {
  const formId = useId()
  const [receipt, setReceipt] = useState('')
  return (
    <div className="grid justify-items-start gap-3">
      <DateRangePicker
        startLabel="Report from"
        endLabel="Report through"
        startName="from"
        endName="through"
        form={formId}
        locale="en-GB"
        defaultValue={{ start: '2028-04-01', end: '2028-04-30' }}
      />
      <form
        id={formId}
        className="flex flex-wrap gap-2"
        onSubmit={event => {
          event.preventDefault()
          const dates = new FormData(event.currentTarget)
          setReceipt(`${dates.get('from')} through ${dates.get('through')}`)
        }}
        onReset={() => setReceipt('')}
      >
        <Button type="submit">Run report</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Restore saved dates
        </Button>
      </form>
      <output aria-live="polite">{receipt}</output>
    </div>
  )
}
