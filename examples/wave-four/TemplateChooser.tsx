'use client'

import { useState } from 'react'
import { Button, Field, ListBox, type ListBoxOption } from '@cognitap/radiant'

const templates: ListBoxOption[] = [
  {
    value: 'research',
    textValue: 'Research notes',
    label: (
      <>
        <strong>Research notes</strong>
        <div>Collect findings and sources as you go.</div>
      </>
    )
  },
  {
    value: 'launch',
    textValue: 'Product launch',
    label: (
      <>
        <strong>Product launch</strong>
        <div>Plan milestones, approvals, and rollout.</div>
      </>
    )
  },
  {
    value: 'archive',
    label: 'Archive (unavailable)',
    disabled: true
  }
]

export function TemplateChooser() {
  const [submitted, setSubmitted] = useState('')
  return (
    <form
      style={{ display: 'grid', gap: '.75rem', width: '100%', maxWidth: '24rem' }}
      onSubmit={event => {
        event.preventDefault()
        setSubmitted('template=' + new FormData(event.currentTarget).get('template'))
      }}
      onReset={() => setSubmitted('')}
    >
      <Field
        label="Project template"
        description="Choose a starting point for your workspace."
        required
      >
        <ListBox
          name="template"
          items={templates}
          defaultValue="research"
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button type="submit">Use template</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset choice
        </Button>
      </div>
      <output aria-live="polite">{submitted}</output>
    </form>
  )
}
