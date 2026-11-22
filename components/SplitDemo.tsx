import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { SplitExample } from '@/examples/split/SplitExample'
export function SplitDemo() {
  return (
    <Demo
      title="Plan a trip"
      files={['split/SplitExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <SplitExample />
      </DemoPreview>
    </Demo>
  )
}
