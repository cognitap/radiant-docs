import { Demo } from './demo/Demo'
import { HoverCardPlayground } from '@/examples/hovercard/HoverCardPlayground'
export function HoverCardDemo() {
  return (
    <Demo
      title="Preview a contributor"
      files={['hovercard/HoverCardExample.tsx']}
    >
      <HoverCardPlayground task="contributor" />
    </Demo>
  )
}
export function HoverCardProjectDemo() {
  return (
    <Demo
      title="Review project progress"
      files={['hovercard/HoverCardExample.tsx']}
    >
      <HoverCardPlayground task="project" />
    </Demo>
  )
}
export function HoverCardResourceDemo() {
  return (
    <Demo
      title="Open reference material"
      files={['hovercard/HoverCardExample.tsx']}
    >
      <HoverCardPlayground task="resource" />
    </Demo>
  )
}
export function HoverCardRelatedDemo() {
  return (
    <Demo
      title="Explore related reading"
      files={['hovercard/HoverCardExample.tsx']}
    >
      <HoverCardPlayground task="related" />
    </Demo>
  )
}
