import { Demo } from './demo/Demo'
import { InputPlayground } from '@/examples/input/InputPlayground'

export function InputDemo() {
  return (
    <Demo
      title="Validate an email address"
      files={['input/InputExample.tsx']}
    >
      <InputPlayground />
    </Demo>
  )
}
