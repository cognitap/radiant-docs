import { CheckboxGroupExample } from '@/examples/checkboxgroup/CheckboxGroupExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function CheckboxGroupDemo() {
  return (
    <Demo
      title="Notification channels"
      files={['checkboxgroup/CheckboxGroupExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <CheckboxGroupExample />
      </DemoPreview>
    </Demo>
  )
}
