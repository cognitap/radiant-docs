'use client'
import { useState } from 'react'
import { Button, Field, NativeSelect, type NativeSelectProps } from '@cognitap/radiant'
export type NativeSelectTaskOptions = Pick<
  NativeSelectProps,
  'controlSize' | 'className' | 'style' | 'dir'
> & { disabled?: boolean; invalid?: boolean; required?: boolean }
export function SaveStudyPhase({
  disabled,
  invalid,
  required = true,
  ...control
}: NativeSelectTaskOptions) {
  const [error, setError] = useState(''),
    [message, setMessage] = useState('Choose the study phase, then save.')
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(
          `Study phase saved: ${new FormData(event.currentTarget).get('phase') ?? 'none'}.`
        )
      }}
      onReset={() => {
        setError('')
        setMessage('Study phase restored.')
      }}
    >
      <Field
        label="Study phase"
        description="The platform picker handles option navigation."
        required={required}
        disabled={disabled}
        error={invalid ? 'Review the study phase.' : error || undefined}
      >
        <NativeSelect
          {...control}
          name="phase"
          defaultValue=""
          onInvalid={() => setError('Choose a study phase.')}
          onChange={() => setError('')}
        >
          <option
            value=""
            disabled
          >
            Choose a phase
          </option>
          <option value="draft">Draft</option>
          <option value="recruiting">Recruiting</option>
          <option value="analysis">Analysis</option>
        </NativeSelect>
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          disabled={disabled}
        >
          Save phase
        </Button>
        <Button
          type="reset"
          variant="outline"
          disabled={disabled}
        >
          Restore phase
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
const studies = {
  reader: {
    title: 'Reader study',
    purpose: 'Understand how readers organize long articles.',
    participants: 12
  },
  component: {
    title: 'Component kit',
    purpose: 'Review how designers compose form controls.',
    participants: 8
  }
}
export function BrowseGroupedStudies({
  disabled,
  invalid,
  required = true,
  ...control
}: NativeSelectTaskOptions) {
  const [study, setStudy] = useState<keyof typeof studies>('reader'),
    record = studies[study]
  return (
    <section
      aria-label="Study browser"
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
    >
      <Field
        label="Open study"
        description="Full and archived studies are unavailable."
        required={required}
        disabled={disabled}
        error={invalid ? 'Review the selected study.' : undefined}
      >
        <NativeSelect
          {...control}
          value={study}
          onChange={event => {
            const value = event.target.value
            if (value === 'reader' || value === 'component') setStudy(value)
          }}
        >
          <optgroup label="Open studies">
            <option value="reader">Reader study</option>
            <option value="component">Component kit</option>
            <option
              value="release"
              disabled
            >
              Release review (full)
            </option>
          </optgroup>
          <optgroup
            label="Archived studies"
            disabled
          >
            <option value="archive">Archived interviews</option>
          </optgroup>
        </NativeSelect>
      </Field>
      <section aria-label="Study details">
        <h3>{record.title}</h3>
        <p>{record.purpose}</p>
        <p>{record.participants} participants</p>
      </section>
    </section>
  )
}
const participants = [
  { name: 'Maya', cohort: 'reader' },
  { name: 'Ivo', cohort: 'reader' },
  { name: 'Lea', cohort: 'component' },
  { name: 'Noah', cohort: 'component' },
  { name: 'Eva', cohort: 'release' }
]
export function FilterParticipantCohorts({
  disabled,
  invalid,
  required = true,
  ...control
}: NativeSelectTaskOptions) {
  const [selected, setSelected] = useState<string[]>(['reader']),
    [applied, setApplied] = useState<string[]>(['reader']),
    [message, setMessage] = useState('Showing the reader cohort.')
  const rows = participants.filter(row => applied.length === 0 || applied.includes(row.cohort))
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        const values = new FormData(event.currentTarget).getAll('cohort').map(String)
        setApplied(values)
        setMessage(
          values.length ? `Applied ${values.length} cohort filters.` : 'Showing every cohort.'
        )
      }}
      onReset={event => {
        event.preventDefault()
        setSelected(['reader'])
        setApplied(['reader'])
        setMessage('Cohort filters restored.')
      }}
    >
      <Field
        label="Participant cohorts"
        description="Use your platform's multiple-selection shortcuts."
        required={required}
        disabled={disabled}
        error={invalid ? 'Choose the cohorts to review.' : undefined}
      >
        <NativeSelect
          {...control}
          multiple
          size={4}
          name="cohort"
          value={selected}
          onChange={event =>
            setSelected(Array.from(event.target.selectedOptions, option => option.value))
          }
        >
          <option value="reader">Readers</option>
          <option value="component">Component designers</option>
          <option value="release">Release reviewers</option>
          <option
            value="archive"
            disabled
          >
            Archived cohort
          </option>
        </NativeSelect>
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          type="submit"
          disabled={disabled}
        >
          Apply cohorts
        </Button>
        <Button
          type="reset"
          variant="outline"
          disabled={disabled}
        >
          Restore cohorts
        </Button>
      </div>
      <ul aria-label="Matching participants">
        {rows.map(row => (
          <li key={row.name}>{row.name}</li>
        ))}
      </ul>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type NativeSelectTask = 'phase' | 'grouped' | 'cohorts'
export function NativeSelectExample({
  task = 'phase',
  ...options
}: NativeSelectTaskOptions & { task?: NativeSelectTask }) {
  return (
    <MotionProvider>
      {task === 'grouped' ? (
        <BrowseGroupedStudies {...options} />
      ) : task === 'cohorts' ? (
        <FilterParticipantCohorts {...options} />
      ) : (
        <SaveStudyPhase {...options} />
      )}
    </MotionProvider>
  )
}
