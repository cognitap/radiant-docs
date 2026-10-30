import { Demo } from './demo/Demo'
import { FieldPlayground } from '@/examples/field/FieldPlayground'

export function FieldDemo() {
  return (
    <Demo
      title="Create a workspace"
      files={['field/FieldValidationExample.tsx']}
    >
      <FieldPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript to submit this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
export function FieldUsernameDemo() {
  return (
    <Demo
      title="Flag a field from a server response"
      files={['field/FieldExample.tsx']}
    >
      <FieldPlayground task="username" />
    </Demo>
  )
}
export function FieldRemindersDemo() {
  return (
    <Demo
      title="Group related choices"
      files={['field/FieldExample.tsx']}
    >
      <FieldPlayground task="reminders" />
    </Demo>
  )
}
