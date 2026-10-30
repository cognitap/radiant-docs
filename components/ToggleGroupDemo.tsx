import { Demo } from './demo/Demo'
import { ToggleGroupPlayground } from '@/examples/togglegroup/ToggleGroupPlayground'
export function ToggleGroupDemo() {
  return (
    <Demo
      title="Align a paragraph"
      files={['togglegroup/ToggleGroupExample.tsx']}
    >
      <ToggleGroupPlayground />
    </Demo>
  )
}
export function ToggleGroupFormattingDemo() {
  return (
    <Demo
      title="Format a note"
      files={['togglegroup/ToggleGroupExample.tsx']}
    >
      <ToggleGroupPlayground task="format" />
    </Demo>
  )
}
export function ToggleGroupViewsDemo() {
  return (
    <Demo
      title="Switch record views"
      files={['togglegroup/ToggleGroupExample.tsx']}
    >
      <ToggleGroupPlayground task="view" />
    </Demo>
  )
}
export function ToggleGroupFilterDemo() {
  return (
    <Demo
      title="Review filter requests"
      files={['togglegroup/ToggleGroupExample.tsx']}
    >
      <ToggleGroupPlayground task="filter" />
    </Demo>
  )
}
