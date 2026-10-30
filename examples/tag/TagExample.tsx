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
            onRemove={event => {
              if (keep && recipient === 'ana@example.com') {
                event.preventDefault()
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

import '@cognitap/radiant/styles.css'
export type TagTask = 'board' | 'recipients'
export function TagExample({ task = 'board', ...options }: TagOptions & { task?: TagTask }) {
  return task === 'board' ? <FilterProjectBoard {...options} /> : <ReviewRecipients {...options} />
}
