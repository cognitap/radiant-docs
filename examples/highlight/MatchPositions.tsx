'use client'

import { Fragment, useState } from 'react'
import { Field, Highlight, Input } from '@cognitap/radiant'

const positions = [
  { label: 'Whole word', text: 'Turn the light off.' },
  { label: 'Middle', text: 'Adjust the backlighting.' },
  { label: 'Prefix', text: 'Follow the lighthouse.' },
  { label: 'Suffix', text: 'Wait for daylight.' }
]

export function MatchPositions() {
  const [query, setQuery] = useState('light')
  return (
    <div style={{ display: 'grid', width: '100%', maxWidth: '24rem', gap: '0.75rem' }}>
      <Field label="Search text">
        <Input
          value={query}
          onChange={event => setQuery(event.currentTarget.value)}
        />
      </Field>
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content minmax(0, 1fr)',
          gap: '0.5rem 0.75rem',
          margin: 0
        }}
      >
        {positions.map(({ label, text }) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd style={{ margin: 0 }}>
              <Highlight
                text={text}
                query={query}
              />
            </dd>
          </Fragment>
        ))}
      </dl>
    </div>
  )
}
