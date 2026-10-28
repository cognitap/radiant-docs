import { Demo } from './demo/Demo'
import { FieldPlayground } from '@/examples/field/FieldPlayground'

export function FieldMotionDemo() {
  return (
    <Demo
      title="A workspace, with room to grow"
      files={['field/FieldValidationExample.tsx']}
    >
      <FieldPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript to submit this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
