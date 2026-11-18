'use client'
import { useState } from 'react'
import { Button, LocaleProvider, NumberFormatter } from '@cognitap/radiant'

export function ReadInvoiceTotal() {
  const [locale, setLocale] = useState('en-US')
  return (
    <div className="grid justify-items-start gap-3">
      <LocaleProvider locale={locale}>
        Invoice total{' '}
        <NumberFormatter
          value={1299.95}
          options={{ style: 'currency', currency: 'EUR' }}
        />
      </LocaleProvider>
      <Button
        variant="outline"
        onClick={() => setLocale(locale === 'en-US' ? 'fr-FR' : 'en-US')}
      >
        {locale === 'en-US' ? 'Use French formatting' : 'Use US formatting'}
      </Button>
    </div>
  )
}
