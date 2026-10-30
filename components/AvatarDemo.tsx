import { Demo } from './demo/Demo'
import { AvatarPlayground } from '@/examples/avatar/AvatarPlayground'
export function AvatarDemo() {
  return (
    <Demo
      title="Profile identity"
      files={['avatar/AvatarExample.tsx']}
    >
      <AvatarPlayground />
    </Demo>
  )
}
