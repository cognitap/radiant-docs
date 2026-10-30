import { Demo } from './demo/Demo'
import { ScrollAreaPlayground } from '@/examples/scrollarea/ScrollAreaPlayground'
export function ScrollAreaDemo() {
  return (
    <Demo
      title="Scroll recent activity"
      files={['scrollarea/ScrollAreaExample.tsx']}
    >
      <ScrollAreaPlayground />
    </Demo>
  )
}
export function ScrollAreaTableDemo() {
  return (
    <Demo
      title="Explore wide records"
      files={['scrollarea/ScrollAreaExample.tsx']}
    >
      <ScrollAreaPlayground task="table" />
    </Demo>
  )
}
export function ScrollAreaSelectDemo() {
  return (
    <Demo
      title="Choose from a long list"
      files={['scrollarea/ScrollAreaExample.tsx']}
    >
      <ScrollAreaPlayground task="select" />
    </Demo>
  )
}
export function ScrollAreaFilterDemo() {
  return (
    <Demo
      title="Filter activity"
      files={['scrollarea/ScrollAreaExample.tsx']}
    >
      <ScrollAreaPlayground task="filter" />
    </Demo>
  )
}
