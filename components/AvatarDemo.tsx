import { Demo } from './demo/Demo'
import { AvatarExample } from '@/examples/avatar/AvatarExample'
export function AvatarDemo() {
  return (
    <Demo
      title="Profile identity"
      files={['avatar/AvatarExample.tsx']}
    >
      <AvatarExample />
    </Demo>
  )
}
