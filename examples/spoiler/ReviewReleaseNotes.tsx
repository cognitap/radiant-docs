'use client'

import { useState } from 'react'
import { Spoiler } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'

export function ReviewReleaseNotes() {
  const [open, setOpen] = useState(false)
  return (
    <MotionProvider>
      <Spoiler
        maxHeight={64}
        open={open}
        onOpenChange={setOpen}
        showMoreLabel="Read release notes"
        showLessLabel="Collapse release notes"
        className="max-w-md"
      >
        <ol className="grid list-decimal gap-3 ps-5">
          <li>Save a copy of your workspace settings.</li>
          <li>Install the update and reopen the application.</li>
          <li>Check that your team members can still access their projects.</li>
        </ol>
      </Spoiler>
    </MotionProvider>
  )
}
