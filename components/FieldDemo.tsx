import { Demo } from './demo/Demo'
import { FieldPlayground } from '@/examples/field/FieldPlayground'

export function FieldDemo() {
  return (
    <Demo
      title="Create a workspace"
      files={['field/FieldValidationExample.tsx']}
    >
      <FieldPlayground />
      <noscript className="demo-feedback">Enable JavaScript to submit this demo.</noscript>
    </Demo>
  )
}
