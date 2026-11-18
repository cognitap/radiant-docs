'use client'

import { Button, Tour, TourTrigger, type TourStep } from '@cognitap/radiant'

const guestSteps: TourStep[] = [
  { target: '[data-guest-point="files"]', title: 'Browse shared files' },
  { target: '[data-guest-point="billing"]', title: 'Manage the subscription' },
  { target: '[data-guest-point="help"]', title: 'Get help from the workspace owner' }
]

export function GuideGuests() {
  return (
    <Tour
      steps={guestSteps}
      className="grid w-full max-w-sm gap-4"
    >
      <TourTrigger>Guide me</TourTrigger>
      <div className="flex flex-wrap gap-2">
        <Button
          data-guest-point="files"
          variant="outline"
        >
          Shared files
        </Button>
        <Button
          data-guest-point="help"
          variant="outline"
        >
          Help
        </Button>
      </div>
    </Tour>
  )
}
