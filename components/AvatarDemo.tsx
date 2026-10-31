import { Demo } from './demo/Demo'
import { AvatarPlayground } from '@/examples/avatar/AvatarPlayground'
const files = ['avatar/AvatarExample.tsx']
export function AvatarDemo() {
  return (
    <Demo
      title="Profile identity"
      files={files}
    >
      <AvatarPlayground task="identity" />
    </Demo>
  )
}
export function AvatarMembersDemo() {
  return (
    <Demo
      title="List members by initials"
      files={files}
    >
      <AvatarPlayground task="members" />
    </Demo>
  )
}
export function AvatarCommentDemo() {
  return (
    <Demo
      title="Keep a name when a photo fails"
      files={files}
    >
      <AvatarPlayground task="comment" />
    </Demo>
  )
}
export function AvatarButtonDemo() {
  return (
    <Demo
      title="Show an avatar beside a name"
      files={files}
    >
      <AvatarPlayground task="button" />
    </Demo>
  )
}
export function AvatarTeamDemo() {
  return (
    <Demo
      title="Stack a team with overflow"
      files={files}
    >
      <AvatarPlayground task="team" />
    </Demo>
  )
}
