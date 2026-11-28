import { SwitchExample } from '@/examples/switch/SwitchExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function SwitchDemo() {
  return (
    <Demo
      title="Notifications"
      files={['switch/SwitchExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <SwitchExample />
      </DemoPreview>
    </Demo>
  )
}
