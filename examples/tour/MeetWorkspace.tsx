'use client'

import { Button, Tour, TourTrigger, type TourStep } from '@cognitap/radiant'

const steps: TourStep[] = [
  {
    target: '[data-tour-point="search"]',
    title: 'Find a project',
    description: 'Search by project name or owner.'
  },
  {
    target: '[data-tour-point="invite"]',
    title: 'Invite your team',
    description: 'Send an invitation to this workspace.'
  }
]

export function MeetWorkspace() {
  return (
    <Tour
      steps={steps}
      className="grid w-full max-w-sm gap-4"
    >
      <TourTrigger>Start tour</TourTrigger>
      <div className="flex flex-wrap gap-2">
        <Button
          data-tour-point="search"
          variant="outline"
        >
          Projects
        </Button>
        <Button
          data-tour-point="invite"
          variant="outline"
        >
          Invite
        </Button>
      </div>
    </Tour>
  )
}
