'use client'

import { useState } from 'react'
import { Button, Tour, TourTrigger } from '@cognitap/radiant'

export function TrackTourState() {
  const [open, setOpen] = useState(false)
  const [visited, setVisited] = useState(false)
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Tour
        steps={[{ target: '[data-story-point="archive"]', title: 'Review archived projects' }]}
        open={open}
        onOpenChange={next => {
          setOpen(next)
          if (!next) setVisited(true)
        }}
        doneLabel="Finish walkthrough"
        className="flex flex-wrap gap-3"
      >
        <TourTrigger>{visited ? 'Replay walkthrough' : 'Start walkthrough'}</TourTrigger>
        <Button
          data-story-point="archive"
          variant="outline"
        >
          Archive
        </Button>
      </Tour>
      <output className="text-sm">{visited && 'Walkthrough viewed'}</output>
    </div>
  )
}
