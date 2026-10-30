import { Demo } from './demo/Demo'
import { FieldsetPlayground } from '@/examples/fieldset/FieldsetPlayground'
export function FieldsetDemo() {
  return (
    <Demo
      title="Shipping fields"
      files={['fieldset/FieldsetExample.tsx']}
    >
      <FieldsetPlayground />
    </Demo>
  )
}
export function FieldsetLockedDemo() {
  return (
    <Demo
      title="Locked address section"
      files={['fieldset/FieldsetExample.tsx']}
    >
      <FieldsetPlayground task="locked" />
    </Demo>
  )
}
export function FieldsetValidationDemo() {
  return (
    <Demo
      title="Validate contact details"
      files={['fieldset/FieldsetExample.tsx']}
    >
      <FieldsetPlayground task="validation" />
    </Demo>
  )
}
