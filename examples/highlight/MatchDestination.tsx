'use client'

import { useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxStatus,
  Highlight
} from '@cognitap/radiant'

const destinations = [
  { value: 'oslo', label: 'Oslo' },
  { value: 'london', label: 'London' },
  { value: 'stockholm', label: 'Stockholm' }
]

export function MatchDestination() {
  const [query, setQuery] = useState('')
  return (
    <div className="w-full max-w-xs">
      <Combobox
        items={destinations}
        query={query}
        onQueryChange={setQuery}
      >
        <ComboboxInput
          aria-label="Destination"
          placeholder="Search destinations"
        />
        <ComboboxPortal>
          <ComboboxContent>
            {destinations.map(item => (
              <ComboboxItem
                key={item.value}
                value={item.value}
                aria-label={item.label}
              >
                <Highlight
                  text={item.label}
                  query={query}
                />
              </ComboboxItem>
            ))}
            <ComboboxStatus />
          </ComboboxContent>
        </ComboboxPortal>
      </Combobox>
    </div>
  )
}
