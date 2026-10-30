'use client'

import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const Profile = dynamic(() =>
  import('./CollapsibleExamples').then(module => module.CollapsibleSettingsExample)
)
const Transition = dynamic(() =>
  import('./CollapsibleExamples').then(module => module.CollapsibleHeightExample)
)

export function CollapsiblePlayground({ states = false }: { states?: boolean }) {
  return (
    <>
      <DemoControls />
      <DemoPreview>{states ? <Transition /> : <Profile />}</DemoPreview>
    </>
  )
}
