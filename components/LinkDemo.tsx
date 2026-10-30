import { Demo } from './demo/Demo'
import { LinkPlayground } from '@/examples/link/LinkPlayground'
import { RouterLinkPlayground } from '@/examples/link/RouterLinkPlayground'
import { MotionLinkPlayground } from '@/examples/link/MotionLinkPlayground'

export function LinkDemo() {
  return (
    <Demo
      title="Read the installation guide"
      files={['link/LinkExample.tsx', 'link/link-example.css']}
    >
      <LinkPlayground />
    </Demo>
  )
}

export function LinkProseDemo() {
  return (
    <Demo
      title="Link inside text"
      files={['link/LinkExample.tsx', 'link/link-example.css']}
    >
      <LinkPlayground task="prose" />
    </Demo>
  )
}

export function RouterLinkDemo() {
  return (
    <Demo
      title="Navigate with a router"
      files={['link/RouterLinkExample.tsx', 'link/link-example.css', 'profile/useHydrated.ts']}
    >
      <RouterLinkPlayground />
    </Demo>
  )
}

export function MotionLinkDemo() {
  return (
    <Demo
      title="Style a link as a button"
      files={['link/MotionLinkExample.tsx', 'link/link-example.css', 'profile/useHydrated.ts']}
    >
      <MotionLinkPlayground />
    </Demo>
  )
}
