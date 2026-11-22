import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { RevealExample } from '@/examples/reveal/RevealExample'
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
