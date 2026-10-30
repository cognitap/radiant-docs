'use client'
import { useState } from 'react'
import { Field, Switch, type ControlSize } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function FocusSettings({ controlSize }: { controlSize?: ControlSize }) {
  const [quiet, setQuiet] = useState(false)
  const [previews, setPreviews] = useState(true)
  return (
    <section
      aria-label="Focus settings"
      style={{ display: 'grid', gap: '1.5rem', maxWidth: '28rem', minWidth: 0 }}
    >
      <Field
        label="Do not disturb"
        description="Silence workspace notifications while you focus."
        style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center' }}
        parts={{ description: { style: { gridColumn: '1 / -1' } } }}
      >
        <Switch
          checked={quiet}
          onChange={event => setQuiet(event.target.checked)}
          controlSize={controlSize}
        />
      </Field>
      <Field
        label="Message previews"
        description="Show the first line of each new message."
        style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center' }}
        parts={{ description: { style: { gridColumn: '1 / -1' } } }}
      >
        <Switch
          checked={previews}
          onChange={event => setPreviews(event.target.checked)}
          controlSize={controlSize}
        />
      </Field>
      <output>
        {quiet
          ? 'Notifications are paused.'
          : `Notifications are on, ${previews ? 'with' : 'without'} previews.`}
      </output>
    </section>
  )
}

const topics = [
  { name: 'mentions', label: 'Mentions and replies' },
  { name: 'digest', label: 'Weekly digest' },
  { name: 'product', label: 'Product news' }
]

export function EmailTopics({ controlSize }: { controlSize?: ControlSize }) {
  const [on, setOn] = useState<Record<string, boolean>>({ mentions: true })
  const chosen = topics.filter(topic => on[topic.name]).map(topic => topic.label)
  return (
    <div style={{ display: 'grid', gap: '1rem', maxWidth: '24rem', minWidth: 0 }}>
      <Field
        layout="group"
        label="Email me about"
        description="Changes apply right away."
      >
        {topics.map(topic => (
          <Switch
            key={topic.name}
            label={topic.label}
            checked={!!on[topic.name]}
            onChange={event => setOn({ ...on, [topic.name]: event.target.checked })}
            controlSize={controlSize}
          />
        ))}
      </Field>
      <output>{chosen.length ? `Emailing you about: ${chosen.join(', ')}.` : 'No emails.'}</output>
    </div>
  )
}
