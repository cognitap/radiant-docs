'use client'
import { useState } from 'react'
import { Button, Checkbox, Tag, type TagProps } from '@cognitap/radiant'
export type TagOptions = Pick<
  TagProps,
  'tone' | 'disabled' | 'pending' | 'className' | 'style' | 'parts'
> & { dir?: 'ltr' | 'rtl' }
export function FilterProjectBoard(options: TagOptions) {
  const [filters, setFilters] = useState(['Design', 'Research']),
    [message, setMessage] = useState('Two filters applied.')
  const projects = [
    { name: 'Reader study', labels: ['Design', 'Research'] },
    { name: 'Component kit', labels: ['Design'] },
    { name: 'Release checklist', labels: ['Delivery'] }
  ]
  return (
    <div
      dir={options.dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
    >
      <p>Remove a filter to broaden the project board.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {filters.map(filter => (
          <Tag
            key={filter}
            {...options}
            removeLabel={`Remove ${filter} filter`}
            onRemove={() => {
              setFilters(current => current.filter(value => value !== filter))
              setMessage(`Removed ${filter} filter.`)
            }}
          >
            {filter}
          </Tag>
        ))}
      </div>
      <ul>
        {projects
          .filter(project => filters.every(filter => project.labels.includes(filter)))
          .map(project => (
            <li key={project.name}>{project.name}</li>
          ))}
      </ul>
      <output aria-live="polite">{message}</output>
      <Button
        variant="outline"
        onClick={() => {
          setFilters(['Design', 'Research'])
          setMessage('Two filters applied.')
        }}
      >
        Restore filters
      </Button>
    </div>
  )
}
export function ReviewRecipients(options: TagOptions) {
  const [recipients, setRecipients] = useState(['ana@example.com', 'sam@example.com']),
    [keep, setKeep] = useState(true),
    [message, setMessage] = useState('Confirm the recipients before sending.')
  return (
    <form
      dir={options.dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(`Report prepared for ${recipients.join(', ') || 'no recipients'}.`)
      }}
    >
      <Checkbox
        label="Keep the project lead"
        checked={keep}
        onChange={event => setKeep(event.currentTarget.checked)}
      />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {recipients.map(recipient => (
          <Tag
            key={recipient}
            {...options}
            removeLabel={`Remove ${recipient}`}
            onRemove={() => {
              if (keep && recipient === 'ana@example.com') {
                setMessage('The project lead must receive this report.')
                return
              }
              setRecipients(current => current.filter(value => value !== recipient))
              setMessage(`Removed ${recipient}.`)
            }}
          >
            {recipient}
          </Tag>
        ))}
      </div>
      <Button type="submit">Prepare report</Button>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

export function SaveLabelRemoval(options: TagOptions) {
  const [labels, setLabels] = useState(['Interview', 'Survey', 'Usability']),
    [saving, setSaving] = useState<string | null>(null),
    [message, setMessage] = useState('Labels are saved with the study.')
  return (
    <div
      dir={options.dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {labels.map(label => (
          <Tag
            key={label}
            {...options}
            pending={options.pending || saving === label}
            disabled={options.disabled || (saving !== null && saving !== label)}
            removeLabel={`Remove ${label} label`}
            onRemove={() => {
              setSaving(label)
              setMessage(`Removing ${label}…`)
              setTimeout(() => {
                setLabels(current => current.filter(value => value !== label))
                setSaving(null)
                setMessage(`Removed ${label} label.`)
              }, 1200)
            }}
          >
            {label}
          </Tag>
        ))}
      </div>
      <output aria-live="polite">{message}</output>
      <Button
        variant="outline"
        disabled={saving !== null}
        onClick={() => {
          setLabels(['Interview', 'Survey', 'Usability'])
          setMessage('Labels are saved with the study.')
        }}
      >
        Restore labels
      </Button>
    </div>
  )
}
export function AssignReviewers(options: TagOptions) {
  const people = [
    { name: 'Ana Lima', role: 'Design' },
    { name: 'Sam Okafor', role: 'Research' }
  ]
  const [reviewers, setReviewers] = useState(people),
    [message, setMessage] = useState('Two reviewers assigned.')
  return (
    <div
      dir={options.dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {reviewers.map(person => (
          <Tag
            key={person.name}
            {...options}
            removeLabel={`Remove ${person.name} from reviewers`}
            onRemove={() => {
              setReviewers(current => current.filter(value => value.name !== person.name))
              setMessage(`Removed ${person.name} from reviewers.`)
            }}
          >
            <strong>{person.name}</strong> · {person.role}
          </Tag>
        ))}
      </div>
      <output aria-live="polite">{message}</output>
      <Button
        variant="outline"
        onClick={() => {
          setReviewers(people)
          setMessage('Two reviewers assigned.')
        }}
      >
        Restore reviewers
      </Button>
    </div>
  )
}

import '@cognitap/radiant/styles.css'
export type TagTask = 'board' | 'recipients' | 'saving' | 'reviewers'
const tasks = {
  board: FilterProjectBoard,
  recipients: ReviewRecipients,
  saving: SaveLabelRemoval,
  reviewers: AssignReviewers
}
export function TagExample({ task = 'board', ...options }: TagOptions & { task?: TagTask }) {
  const Task = tasks[task]
  return <Task {...options} />
}
