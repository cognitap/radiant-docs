'use client'

import { useState } from 'react'
import { Button, DateField, Field, LocaleProvider } from '@cognitap/radiant'

export function InvoiceDate() {
  const [receipt, setReceipt] = useState('')
  return (
    <LocaleProvider locale="fr-FR">
      <form
        style={{ display: 'grid', gap: '.75rem', width: '100%', maxWidth: '24rem' }}
        onSubmit={event => {
          event.preventDefault()
          setReceipt(String(new FormData(event.currentTarget).get('invoiceDate')))
        }}
        onReset={() => setReceipt('')}
      >
        <Field
          label="Date de facturation"
          description="Saisissez le jour, le mois et l’année."
          required
        >
          <DateField
            name="invoiceDate"
            min="2028-02-01"
            defaultValue="2028-02-29"
          />
        </Field>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          <Button type="submit">Enregistrer</Button>
          <Button
            type="reset"
            variant="outline"
          >
            Réinitialiser
          </Button>
        </div>
        <output aria-live="polite">{receipt}</output>
      </form>
    </LocaleProvider>
  )
}
