'use client'

import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview, usePreviewTheme } from '@/components/demo/DemoFrame'

const Profile = dynamic(() =>
  import('./CollapsibleExamples').then(module => module.CollapsibleSettingsExample)
)
const Transition = dynamic(() =>
  import('./CollapsibleExamples').then(module => module.CollapsibleHeightExample)
)

export function CollapsiblePlayground({ states = false }: { states?: boolean }) {
  const { theme } = usePreviewTheme()
  return (
    <>
      <DemoControls />
      <DemoPreview>{states ? <Transition theme={theme} /> : <Profile theme={theme} />}</DemoPreview>
    </>
  )
}
