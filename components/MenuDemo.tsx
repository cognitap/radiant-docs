import { Demo } from './demo/Demo'
import { MenuPlayground } from '@/examples/menu/MenuPlayground'
export function MenuDemo() {
  return (
    <Demo
      title="Manage project files"
      files={['menu/MenuExample.tsx']}
    >
      <MenuPlayground task="file" />
    </Demo>
  )
}
export function MenuCanvasDemo() {
  return (
    <Demo
      title="Configure a canvas"
      files={['menu/MenuExample.tsx']}
    >
      <MenuPlayground task="canvas" />
    </Demo>
  )
}
export function MenuExportDemo() {
  return (
    <Demo
      title="Export a report"
      files={['menu/MenuExample.tsx']}
    >
      <MenuPlayground task="export" />
    </Demo>
  )
}
export function MenuFormDemo() {
  return (
    <Demo
      title="Submit report actions"
      files={['menu/MenuExample.tsx']}
    >
      <MenuPlayground task="form" />
    </Demo>
  )
}
