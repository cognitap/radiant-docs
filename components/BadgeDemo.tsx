import { BadgeExample } from '@/examples/badge/BadgeExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function BadgeDemo() {
  return (
    <Demo
      title="Release status"
      files={['badge/BadgeExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <BadgeExample />
      </DemoPreview>
    </Demo>
  )
}
