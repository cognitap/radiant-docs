import { CheckboxExample } from '@/examples/checkbox/CheckboxExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function CheckboxDemo() {
  return (
    <Demo
      title="Toggle a preference"
      files={['checkbox/CheckboxExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <CheckboxExample />
      </DemoPreview>
    </Demo>
  )
}
