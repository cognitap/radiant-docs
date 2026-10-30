import { Demo } from './demo/Demo'
import { InputPlayground } from '@/examples/input/InputPlayground'
export function InputDemo() {
  return (
    <Demo
      title="Update your profile"
      files={['input/InputExample.tsx']}
    >
      <InputPlayground task="profile" />
    </Demo>
  )
}
export function InputProjectDemo() {
  return (
    <Demo
      title="Name a project"
      files={['input/InputExample.tsx']}
    >
      <InputPlayground task="project" />
    </Demo>
  )
}
export function InputSubmittedDemo() {
  return (
    <Demo
      title="Confirm what a form submits"
      files={['input/InputExample.tsx']}
    >
      <InputPlayground task="submitted" />
    </Demo>
  )
}
export function InputSizesDemo() {
  return (
    <Demo
      title="Match nearby control sizes"
      files={['input/InputExample.tsx']}
    >
      <InputPlayground task="sizes" />
    </Demo>
  )
}
