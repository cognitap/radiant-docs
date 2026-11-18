'use client'

import { useState } from 'react'
import { Field, Highlight, Input } from '@cognitap/radiant'

export function FindCafe() {
  const [query, setQuery] = useState('cafe')
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Field label="Search venue notes">
        <Input
          value={query}
          onChange={event => setQuery(event.currentTarget.value)}
        />
      </Field>
      <p>
        <Highlight
          text="The café is beside the east entrance, opposite the lift."
          query={query}
          ignoreDiacritics
        />
      </p>
    </div>
  )
}
