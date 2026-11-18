'use client'
import { RingProgress } from '@cognitap/radiant'

export function WaitForSync() {
  return (
    <RingProgress
      aria-label="Syncing files"
      label="Syncing"
    />
  )
}
