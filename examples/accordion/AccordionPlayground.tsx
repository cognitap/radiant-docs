'use client'

import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview, usePreviewTheme } from '@/components/demo/DemoFrame'

const Profile = dynamic(() =>
  import('./AccordionExamples').then(module => module.AccordionGuideExample)
)
const Transition = dynamic(() =>
  import('./AccordionExamples').then(module => module.AccordionSelectionExample)
)

export function AccordionPlayground({ states = false }: { states?: boolean }) {
  const { theme } = usePreviewTheme()
  return (
    <>
      <DemoControls />
      <DemoPreview>{states ? <Transition theme={theme} /> : <Profile />}</DemoPreview>
    </>
  )
}
