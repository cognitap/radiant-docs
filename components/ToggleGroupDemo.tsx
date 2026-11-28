import { ToggleGroupExample } from '@/examples/togglegroup/ToggleGroupExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function ToggleGroupDemo() {
  return (
    <Demo
      title="Align text"
      files={['togglegroup/ToggleGroupExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ToggleGroupExample />
      </DemoPreview>
    </Demo>
  )
}
