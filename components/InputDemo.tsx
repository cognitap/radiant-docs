import { Demo } from './demo/Demo'
import { InputPlayground } from '@/examples/input/InputPlayground'

export function InputMotionDemo() {
  return (
    <Demo
      title="Your profile, in focus"
      files={['input/InputProfileExample.tsx']}
    >
      <InputPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
