import { Demo } from './demo/Demo'
import { StackPlayground } from '@/examples/stack/StackPlayground'
export function StackDemo() {
  return (
    <Demo
      title="Arrange actions"
      files={['stack/StackExample.tsx']}
    >
      <StackPlayground />
    </Demo>
  )
}
export function StackTagsDemo() {
  return (
    <Demo
      title="Wrap tags"
      files={['stack/StackExample.tsx']}
    >
      <StackPlayground task="tags" />
    </Demo>
  )
}
