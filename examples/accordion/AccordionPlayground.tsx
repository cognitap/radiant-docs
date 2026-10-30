'use client'

import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const Profile = dynamic(() =>
  import('./AccordionExamples').then(module => module.AccordionGuideExample)
)
const Transition = dynamic(() =>
  import('./AccordionExamples').then(module => module.AccordionSelectionExample)
)

export function AccordionPlayground({ states = false }: { states?: boolean }) {
  return (
    <>
      <DemoControls />
      <DemoPreview>{states ? <Transition /> : <Profile />}</DemoPreview>
    </>
  )
}
