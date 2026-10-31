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
      title="Refuse a removal"
      files={['tag/TagExample.tsx']}
    >
      <TagPlayground task="recipients" />
    </Demo>
  )
}
export function TagSavingDemo() {
  return (
    <Demo
      title="Show a pending removal"
      files={['tag/TagExample.tsx']}
    >
      <TagPlayground task="saving" />
    </Demo>
  )
}
export function TagReviewersDemo() {
  return (
    <Demo
      title="Name rich content"
      files={['tag/TagExample.tsx']}
    >
      <TagPlayground task="reviewers" />
    </Demo>
  )
}
