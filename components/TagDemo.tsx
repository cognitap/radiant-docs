import { Demo } from './demo/Demo'
import { TagPlayground } from '@/examples/tag/TagPlayground'
export function TagDemo() {
  return (
    <Demo
      title="Filter the project board"
      files={['tag/TagExample.tsx']}
    >
      <TagPlayground task="board" />
    </Demo>
  )
}
export function TagRecipientsDemo() {
  return (
    <Demo
      title="Review report recipients"
      files={['tag/TagExample.tsx']}
    >
      <TagPlayground task="recipients" />
    </Demo>
  )
}
