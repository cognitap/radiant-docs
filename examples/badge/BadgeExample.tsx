'use client'
import { useState } from 'react'
import { Badge } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
const states = {
  draft: { label: 'Draft', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'accent' },
  attention: { label: 'Needs attention', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'danger' }
} as const
export function BadgeExample() {
  const [status, setStatus] = useState<keyof typeof states>('draft')
  const [decorative, setDecorative] = useState(false)
  const selection = states[status]
  return (
    <>
      <DemoControls>
        <label>
          Release status{' '}
          <select
            value={status}
            onChange={event => {
              const value = event.target.value
              if (
                value === 'draft' ||
                value === 'approved' ||
                value === 'attention' ||
                value === 'blocked'
              )
                setStatus(value)
            }}
          >
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="attention">Needs attention</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={decorative}
            onChange={event => setDecorative(event.target.checked)}
          />{' '}
          Repeat meaning in adjacent text
        </label>
      </DemoControls>
      <DemoPreview>
        <div style={{ maxWidth: '100%' }}>
          <p>
            Release status: {decorative && <span>{selection.label} </span>}
            <Badge
              tone={selection.tone}
              decorative={decorative}
            >
              {selection.label}
            </Badge>
          </p>
        </div>
      </DemoPreview>
    </>
  )
}
