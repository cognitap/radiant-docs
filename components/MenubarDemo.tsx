import { Demo } from './demo/Demo'
import { MenubarPlayground } from '@/examples/menubar/MenubarPlayground'
export function MenubarDemo() {
  return (
    <Demo
      title="Edit a document"
      files={['menubar/MenubarExample.tsx']}
    >
      <MenubarPlayground task="document" />
    </Demo>
  )
}
export function MenubarBoardDemo() {
  return (
    <Demo
      title="Organize a planning board"
      files={['menubar/MenubarExample.tsx']}
    >
      <MenubarPlayground task="board" />
    </Demo>
  )
}
export function MenubarReportDemo() {
  return (
    <Demo
      title="Submit report commands"
      files={['menubar/MenubarExample.tsx']}
    >
      <MenubarPlayground task="report" />
    </Demo>
  )
}
