'use client'
import { useState } from 'react'
import { Button, Checkbox, Field, TagsInput, type TagsInputProps } from '@cognitap/radiant'
export type TagsTaskOptions = Pick<
  TagsInputProps,
  | 'controlSize'
  | 'disabled'
  | 'readOnly'
  | 'className'
  | 'style'
  | 'parts'
  | 'maxCount'
  | 'separators'
> & { dir?: 'ltr' | 'rtl'; initialValues?: string[] }
export function LabelResearchNotes({
  dir,
  initialValues = ['research'],
  maxCount = 4,
  ...props
}: TagsTaskOptions) {
  const [message, setMessage] = useState('Add a topic, then press Enter or a comma.')
  return (
    <form
      dir={dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(
          `Saved topics: ${new FormData(event.currentTarget).getAll('topics').join(', ') || 'none'}.`
        )
      }}
      onReset={() => setMessage('Labels restored.')}
    >
      <Field
        label="Research topics"
        description="Use at least three characters per topic."
        required
      >
        <TagsInput
          {...props}
          defaultValue={initialValues}
          name="topics"
          maxCount={maxCount}
          validate={value => value.length >= 3 || 'Use at least three characters.'}
        />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button type="submit">Save topics</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset topics
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function InviteWorkshopGuests({
  dir,
  initialValues = [],
  maxCount = 3,
  separators = [',', ';'],
  ...props
}: TagsTaskOptions) {
  const [message, setMessage] = useState('Add guests, then prepare the invitations.')
  return (
    <form
      dir={dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(
          `Invitations prepared for ${new FormData(event.currentTarget).getAll('guests').join(', ')}.`
        )
      }}
    >
      <Field
        label="Guest emails"
        description={`Add up to ${maxCount} addresses; separate them with ${separators.join(' or ')} or line breaks.`}
        required
      >
        <TagsInput
          {...props}
          name="guests"
          defaultValue={initialValues}
          maxCount={maxCount}
          separators={separators}
          validate={value =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a complete email address.'
          }
        />
      </Field>
      <Button type="submit">Prepare invitations</Button>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
export function ProtectReleaseLabels({
  dir,
  initialValues = ['release'],
  maxCount = 4,
  ...props
}: TagsTaskOptions) {
  const [values, setValues] = useState(initialValues),
    [keep, setKeep] = useState(true),
    [message, setMessage] = useState('The release label is protected.')
  return (
    <div
      dir={dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
    >
      <Checkbox
        label="Keep the release label"
        checked={keep}
        onChange={event => setKeep(event.currentTarget.checked)}
      />
      <Field
        label="Release labels"
        description="Add labels or remove them with Backspace."
      >
        <TagsInput
          {...props}
          value={values}
          onValueChange={next => {
            if (keep && !next.includes('release'))
              setMessage('Keep the release label until review is complete.')
            else {
              setValues(next)
              setMessage(`Labels: ${next.join(', ') || 'none'}.`)
            }
          }}
          maxCount={maxCount}
        />
      </Field>
      <output aria-live="polite">{message}</output>
    </div>
  )
}

import '@cognitap/radiant/styles.css'
export type TagsInputTask = 'topics' | 'guests' | 'protected'
export function TagsInputExample({
  task = 'topics',
  ...options
}: TagsTaskOptions & { task?: TagsInputTask }) {
  return task === 'topics' ? (
    <LabelResearchNotes {...options} />
  ) : task === 'guests' ? (
    <InviteWorkshopGuests {...options} />
  ) : (
    <ProtectReleaseLabels {...options} />
  )
}
