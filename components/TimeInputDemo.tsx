import type { ReactNode } from 'react'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function TimeInputDemo({
  title,
  file,
  children
}: {
  title: string
  file: string
  children: ReactNode
}) {
  return (
    <Demo
      title={title}
      files={[file]}
    >
      <DemoControls />
      <DemoPreview>{children}</DemoPreview>
    </Demo>
  )
}
