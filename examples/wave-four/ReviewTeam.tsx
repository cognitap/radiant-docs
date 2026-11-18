'use client'

import { useState } from 'react'
import { Button, Field, MultiSelect } from '@cognitap/radiant'

const reviewers = [
  { value: 'ana', label: 'Ana Petrescu' },
  { value: 'sam', label: 'Sam Novak' },
  { value: 'lee', label: 'Lee Park' }
]

export function ReviewTeam() {
  const [submitted, setSubmitted] = useState('')
  return (
    <form
      style={{ display: 'grid', gap: '.75rem', width: '100%', maxWidth: '24rem' }}
      onSubmit={event => {
        event.preventDefault()
        const values = new FormData(event.currentTarget).getAll('reviewers')
        setSubmitted(
          new URLSearchParams(values.map(value => ['reviewers', String(value)])).toString()
        )
      }}
      onReset={() => setSubmitted('')}
    >
      <Field
        label="Review team"
        description="Search by name and add everyone who should review the brief."
        required
      >
        <MultiSelect
          name="reviewers"
          items={reviewers}
          defaultValue={['ana']}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button type="submit">Save review team</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset team
        </Button>
      </div>
      <output aria-live="polite">{submitted}</output>
    </form>
  )
}
