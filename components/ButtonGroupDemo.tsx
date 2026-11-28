import { ButtonGroupExample } from '@/examples/buttongroup/ButtonGroupExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function ButtonGroupDemo() {
  return (
    <Demo
      title="Browse weeks"
      files={['buttongroup/ButtonGroupExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ButtonGroupExample />
      </DemoPreview>
    </Demo>
  )
}
