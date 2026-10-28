import { Demo } from './demo/Demo'
import { LinkPlayground } from '@/examples/link/LinkPlayground'
import { RouterLinkPlayground } from '@/examples/link/RouterLinkPlayground'
import { MotionLinkPlayground } from '@/examples/link/MotionLinkPlayground'

export function LinkDemo() {
  return (
    <Demo
      title="Interactive Link"
      files={['link/LinkExample.tsx', 'link/link-example.css']}
    >
      <LinkPlayground />
    </Demo>
  )
}

export function RouterLinkDemo() {
  return (
    <Demo
      title="Router link and ref"
      files={['link/RouterLinkExample.tsx', 'link/link-example.css', 'profile/useHydrated.ts']}
    >
      <RouterLinkPlayground />
    </Demo>
  )
}

export function MotionLinkDemo() {
  return (
    <Demo
      title="Link and Button motion"
      files={['link/MotionLinkExample.tsx', 'link/link-example.css', 'profile/useHydrated.ts']}
    >
      <MotionLinkPlayground />
    </Demo>
  )
}
