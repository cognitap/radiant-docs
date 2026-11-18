'use client'
import { RingProgress } from '@cognitap/radiant'

export function ReviewStorage() {
  return (
    <div className="grid justify-items-center gap-3">
      <RingProgress
        kind="meter"
        aria-label="Storage used"
        aria-valuetext="64 of 100 gigabytes"
        label="64 GB"
        segments={[{ value: 40 }, { value: 24, tone: 'warning' }]}
      />
      <div className="text-sm">40 GB documents, 24 GB media</div>
    </div>
  )
}
