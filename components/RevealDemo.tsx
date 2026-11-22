import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { PlayNotices, RevealExample } from '@/examples/reveal/RevealExample'
export function RevealDemo() {
  return (
    <Demo
      title="Follow a recipe"
      files={['reveal/RevealExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <RevealExample />
      </DemoPreview>
    </Demo>
  )
}
export function PlayNoticesDemo() {
  return (
    <Demo
      title="Play lobby notices"
      files={['reveal/RevealExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PlayNotices />
      </DemoPreview>
    </Demo>
  )
}
