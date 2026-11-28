import { ButtonExample } from '@/examples/button/ButtonExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function ButtonDemo() {
  return (
    <Demo
      title="Save changes"
      files={['button/ButtonExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ButtonExample />
      </DemoPreview>
    </Demo>
  )
}
