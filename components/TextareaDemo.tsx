import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { TextareaExample } from '@/examples/textarea/TextareaExample'

export function TextareaDemo() {
  return (
    <Demo
      title="Grow with content"
      files={['textarea/TextareaExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <TextareaExample />
      </DemoPreview>
    </Demo>
  )
}
