import { Demo } from './demo/Demo'
import { TagsInputPlayground } from '@/examples/tagsinput/TagsInputPlayground'
export function TagsInputDemo() {
  return (
    <Demo
      title="Label research notes"
      files={['tagsinput/TagsInputExample.tsx']}
    >
      <TagsInputPlayground task="topics" />
    </Demo>
  )
}
export function TagsInputGuestsDemo() {
  return (
    <Demo
      title="Invite workshop guests"
      files={['tagsinput/TagsInputExample.tsx']}
    >
      <TagsInputPlayground task="guests" />
    </Demo>
  )
}
export function TagsInputProtectedDemo() {
  return (
    <Demo
      title="Protect release labels"
      files={['tagsinput/TagsInputExample.tsx']}
    >
      <TagsInputPlayground task="protected" />
    </Demo>
  )
}
