import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { CompareExample } from '@/examples/compare/CompareExample'
export function CompareDemo() {
  return (
    <Demo
      title="Compare plans"
      files={['compare/CompareExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <CompareExample />
      </DemoPreview>
    </Demo>
  )
}
