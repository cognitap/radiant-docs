'use client'
import { useState } from 'react'
import { Stepper } from '@cognitap/radiant'

const steps = [
  { value: 'billing', label: 'Billing' },
  { value: 'security', label: 'Security' },
  { value: 'access', label: 'Access' }
]
export function InspectWorkspaceChecks() {
  const [current, setCurrent] = useState('billing')
  const title = steps.find(step => step.value === current)?.label
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Stepper
        aria-label="Workspace checks"
        steps={steps}
        value={current}
        navigation="free"
        controlSize="small"
        onValueChange={setCurrent}
      />
      <output className="text-sm">Reviewing {title}</output>
    </div>
  )
}
