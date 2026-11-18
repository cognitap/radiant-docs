'use client'

import { useState } from 'react'
import { Button, ColorInput, Field } from '@cognitap/radiant'

export function SaveAccent() {
  const [saved, setSaved] = useState('')
  return (
    <form
      className="grid w-full max-w-xs gap-3"
      onReset={() => setSaved('')}
      onSubmit={event => {
        event.preventDefault()
        setSaved(String(new FormData(event.currentTarget).get('accent')))
      }}
    >
      <Field
        label="Workspace accent"
        description="Enter hex, RGB, or OKLCH."
        required
      >
        <ColorInput
          name="accent"
          placeholder="#405CE0"
          swatches={[{ color: '#405CE0', label: 'Indigo' }]}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">Save accent</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset
        </Button>
      </div>
      <output className="text-sm">{saved && 'Saved ' + saved}</output>
    </form>
  )
}
