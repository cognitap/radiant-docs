import { Demo } from './demo/Demo'
import { TextareaPlayground } from '@/examples/textarea/TextareaPlayground'
const files = [
  'textarea/TextareaExample.tsx',
  'textarea/textarea-example.css',
  'profile/useHydrated.ts'
]
export function TextareaDemo() {
  return (
    <Demo
      title="Describe a project"
      files={files}
    >
      <TextareaPlayground />
    </Demo>
  )
}
export function TextareaIntroductionDemo() {
  return (
    <Demo
      title="Introduce your workspace"
      files={files}
    >
      <TextareaPlayground task="introduce" />
    </Demo>
  )
}
export function TextareaReplyDemo() {
  return (
    <Demo
      title="Grow a reply with its content"
      files={files}
    >
      <TextareaPlayground task="reply" />
    </Demo>
  )
}
