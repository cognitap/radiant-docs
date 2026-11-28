import { ToolbarExample } from '@/examples/toolbar/ToolbarExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function ToolbarDemo() {
  return (
    <Demo
      title="Format text"
      files={['toolbar/ToolbarExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ToolbarExample />
      </DemoPreview>
    </Demo>
  )
}
