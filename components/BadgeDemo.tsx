import { Demo } from './demo/Demo'
import { BadgePlayground } from '@/examples/badge/BadgePlayground'
export function BadgeDemo() {
  return (
    <Demo
      title="Release category"
      files={['badge/BadgeExample.tsx']}
    >
      <BadgePlayground />
    </Demo>
  )
}
export function BadgeTableDemo() {
  return (
    <Demo
      title="Show status in a table"
      files={['badge/BadgeExample.tsx']}
    >
      <BadgePlayground task="table" />
    </Demo>
  )
}
export function BadgeCountDemo() {
  return (
    <Demo
      title="Count items beside a heading"
      files={['badge/BadgeExample.tsx']}
    >
      <BadgePlayground task="counts" />
    </Demo>
  )
}
export function BadgeDecorativeDemo() {
  return (
    <Demo
      title="Hide repeated text"
      files={['badge/BadgeExample.tsx']}
    >
      <BadgePlayground task="decorative" />
    </Demo>
  )
}
