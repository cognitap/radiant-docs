'use client'
import { Stepper } from '@cognitap/radiant'

export function ReviewApplication() {
  return (
    <Stepper
      aria-label="Application status"
      orientation="vertical"
      defaultValue="references"
      className="w-full max-w-sm"
      steps={[
        { value: 'profile', label: 'Profile', description: 'Contact details', completed: true },
        { value: 'references', label: 'References', error: 'Add a second reference.' },
        { value: 'review', label: 'Review', disabled: true }
      ]}
    />
  )
}
