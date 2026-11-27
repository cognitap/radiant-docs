import { InputGroupExample } from '@/examples/inputgroup/InputGroupExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function InputGroupDemo() {
  return (
    <Demo
      title="Add a prefix and an action"
      files={['inputgroup/InputGroupExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <InputGroupExample />
      </DemoPreview>
    </Demo>
  )
}
