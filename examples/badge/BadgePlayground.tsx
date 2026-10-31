'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import {
  ApprovedNotice,
  ReleaseStatus,
  ReleaseTable,
  ReviewCounts,
  statuses,
  type Status
} from './BadgeExample'
export type BadgeTask = 'status' | 'table' | 'counts' | 'decorative'
const options = ['draft', 'approved', 'review', 'blocked'] as const satisfies readonly Status[]
const optionLabels = {
  draft: statuses.draft.label,
  approved: statuses.approved.label,
  review: statuses.review.label,
  blocked: statuses.blocked.label
}
export function BadgePlayground({ task = 'status' }: { task?: BadgeTask }) {
  const [status, setStatus] = useState<Status>('draft'),
    [decorative, setDecorative] = useState(false)
  return (
    <>
      <DemoControls>
        {task === 'status' && (
          <div className="action-options">
            <SelectControl
              label="Release status"
              value={status}
              options={options}
              optionLabels={optionLabels}
              onChange={setStatus}
            />
            <Checkbox
              label="Repeat meaning in adjacent text"
              checked={decorative}
              onChange={event => setDecorative(event.target.checked)}
            />
          </div>
        )}
      </DemoControls>
      <DemoPreview>
        {task === 'table' ? (
          <ReleaseTable />
        ) : task === 'counts' ? (
          <ReviewCounts />
        ) : task === 'decorative' ? (
          <ApprovedNotice />
        ) : (
          <ReleaseStatus
            status={status}
            decorative={decorative}
          />
        )}
      </DemoPreview>
    </>
  )
}
