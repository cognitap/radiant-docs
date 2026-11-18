'use client'
import { useState } from 'react'
import { Field, LocaleProvider, NativeSelect, NumberFormatter } from '@cognitap/radiant'

export function SwitchQuoteLocale() {
  const [locale, setLocale] = useState('en-GB')
  const french = locale === 'fr-FR'
  return (
    <div className="grid w-full max-w-md gap-4">
      <Field label="Quote language">
        <NativeSelect
          value={locale}
          onChange={event => setLocale(event.currentTarget.value)}
        >
          <option value="en-GB">English (UK)</option>
          <option value="fr-FR">Français</option>
        </NativeSelect>
      </Field>
      <LocaleProvider locale={locale}>
        <output aria-live="polite">
          {french ? 'Estimation' : 'Estimate'}{' '}
          <NumberFormatter
            value={1234.5}
            options={{ style: 'currency', currency: 'EUR' }}
          />
        </output>
      </LocaleProvider>
    </div>
  )
}
