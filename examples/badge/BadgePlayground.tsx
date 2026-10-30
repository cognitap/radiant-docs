'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { BadgeExample, type BadgeStatus } from './BadgeExample'

export function BadgePlayground() {
  const [status, setStatus] = useState<BadgeStatus>('draft')
  const [decorative, setDecorative] = useState(false)

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
        <BadgeExample
          status={status}
          decorative={decorative}
        />
      </DemoPreview>
    </>
  )
}
