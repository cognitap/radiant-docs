import { Demo } from './demo/Demo'
import { CheckboxGroupPlayground } from '@/examples/checkboxgroup/CheckboxGroupPlayground'
export function CheckboxGroupDemo() {
  return (
    <Demo
      title="Notification channels"
      files={['checkboxgroup/CheckboxGroupExample.tsx']}
    >
      <CheckboxGroupPlayground />
    </Demo>
  )
}
export function CheckboxGroupAvailableDemo() {
  return (
    <Demo
      title="Select available channels"
      files={['checkboxgroup/CheckboxGroupExample.tsx']}
    >
      <CheckboxGroupPlayground task="available" />
    </Demo>
  )
}
export function CheckboxGroupSavingDemo() {
  return (
    <Demo
      title="Save notification preferences"
      files={['checkboxgroup/CheckboxGroupExample.tsx']}
    >
      <CheckboxGroupPlayground task="save" />
    </Demo>
  )
}
