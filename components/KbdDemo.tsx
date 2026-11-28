import { KbdExample } from '@/examples/kbd/KbdExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function KbdDemo() {
  return (
    <Demo
      title="Keyboard keys"
      files={['kbd/KbdExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <KbdExample />
      </DemoPreview>
    </Demo>
  )
}
