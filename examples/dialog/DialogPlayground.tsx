'use client'

import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview, usePreviewTheme } from '@/components/demo/DemoFrame'

const Profile = dynamic(() =>
  import('./DialogExamples').then(module => module.DialogProfileExample)
)
const Transition = dynamic(() =>
  import('./DialogExamples').then(module => module.DialogTransitionExample)
)

export function DialogPlayground({ states = false }: { states?: boolean }) {
  const { theme } = usePreviewTheme()
  return (
    <>
      <DemoControls />
      <DemoPreview>{states ? <Transition theme={theme} /> : <Profile theme={theme} />}</DemoPreview>
    </>
  )
}
