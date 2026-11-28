import { RadioExample } from '@/examples/radio/RadioExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function RadioDemo() {
  return (
    <Demo
      title="Delivery options"
      files={['radio/RadioExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <RadioExample />
      </DemoPreview>
    </Demo>
  )
}
