'use client'

import { useEffect, useState } from 'react'
import { Combobox, Field, type ComboboxOption } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import { cityOptions } from './cities'

/** The application owns request timing, cancellation, response ordering and the selected label. */
export function ComboboxAsyncExample() {
  const ready = useHydrated()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ComboboxOption | undefined>(cityOptions[2])
  const [result, setResult] = useState<{
    query: string
    items: ComboboxOption[]
    loading: boolean
    error?: string
  }>({ query: '', items: [], loading: true })
  useEffect(() => {
    // The delayed lookup stands in for fetch; cleanup prevents stale results from winning.
    let current = true

    const timer = setTimeout(() => {
      if (!current) return
      if (query.toLowerCase() === 'error')
        setResult({
          query,
          items: [],
          loading: false,
          error: 'Cities could not be loaded. Change your search to try again.'
        })
      else
        setResult({
          query,
          items: cityOptions.filter(item =>
            String(item.label).toLowerCase().includes(query.toLowerCase())
          ),
          loading: false
        })
    }, 650)
    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [query])
  return (
    <div style={{ display: 'grid', width: '20rem', maxWidth: '100%', gap: '1rem' }}>
      <Field
        label="City"
        description="Search remote results. Try “error” to see a failed request."
      >
        <Combobox
          items={result.items}
          disabled={!ready}
          filter={null}
          query={query}
          onQueryChange={setQuery}
          value={selected?.value ?? null}
          selectedItem={selected}
          onValueChange={next =>
            setSelected(next === null ? undefined : result.items.find(item => item.value === next))
          }
          loading={result.loading || result.query !== query}
          error={result.query === query ? result.error : undefined}
        />
      </Field>
      <p>Selected: {selected?.label ?? 'None'}</p>
    </div>
  )
}
