import { Demo } from './demo/Demo'
import { ContextMenuPlayground } from '@/examples/contextmenu/ContextMenuPlayground'
export function ContextMenuDemo() {
  return (
    <Demo
      title="Manage a project file"
      files={['contextmenu/ContextMenuExample.tsx']}
    >
      <ContextMenuPlayground task="file" />
    </Demo>
  )
}
export function ContextMenuCanvasDemo() {
  return (
    <Demo
      title="Configure a planning canvas"
      files={['contextmenu/ContextMenuExample.tsx']}
    >
      <ContextMenuPlayground task="canvas" />
    </Demo>
  )
}
export function ContextMenuReportDemo() {
  return (
    <Demo
      title="Review a report"
      files={['contextmenu/ContextMenuExample.tsx']}
    >
      <ContextMenuPlayground task="report" />
    </Demo>
  )
}
