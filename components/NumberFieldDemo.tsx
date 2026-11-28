import { NumberFieldExample } from '@/examples/numberfield/NumberFieldExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function NumberFieldDemo() {
  return (
    <Demo
      title="Edit a price"
      files={['numberfield/NumberFieldExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <NumberFieldExample />
      </DemoPreview>
    </Demo>
  )
}
