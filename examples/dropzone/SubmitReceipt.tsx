'use client'

import { useState } from 'react'
import { Button, Dropzone, Field } from '@cognitap/radiant'

export function SubmitReceipt() {
  const [receipt, setReceipt] = useState('')
  return (
    <form
      className="grid w-full max-w-sm gap-3"
      onReset={() => setReceipt('')}
      onSubmit={event => {
        event.preventDefault()
        const file = new FormData(event.currentTarget).get('receipt')
        if (file instanceof File) setReceipt(file.name)
      }}
    >
      <Field
        label="Receipt"
        required
      >
        <Dropzone
          name="receipt"
          accept=".pdf"
          description="Choose one PDF."
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Submit receipt</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset
        </Button>
      </div>
      <output className="text-sm">{receipt && 'Submitted ' + receipt}</output>
    </form>
  )
}
