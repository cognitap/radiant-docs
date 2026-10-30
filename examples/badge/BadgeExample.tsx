'use client'

import { Badge } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

const states = {
  draft: { label: 'Draft', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'accent' },
  attention: { label: 'Needs attention', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'danger' }
} as const

export type BadgeStatus = keyof typeof states

export function BadgeExample({
  status = 'draft',
  decorative = false
}: {
  status?: BadgeStatus
  decorative?: boolean
}) {
  const selection = states[status]

  return (
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
  )
}
