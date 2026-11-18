'use client'

import { useState } from 'react'
import { Button, DatePicker, Field, LocaleProvider } from '@cognitap/radiant'

export function ArrivalForm() {
  const [receipt, setReceipt] = useState('')
  return (
    <LocaleProvider locale="fr-FR">
      <form
        className="grid gap-3"
        onSubmit={event => {
          event.preventDefault()
          setReceipt(String(new FormData(event.currentTarget).get('arrival')))
        }}
        onReset={() => setReceipt('')}
      >
        <Field
          label="Date d’arrivée"
          required
        >
          <DatePicker
            calendarLabel="Choisir une date d’arrivée"
            name="arrival"
            defaultValue="2028-03-09"
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Confirmer</Button>
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
