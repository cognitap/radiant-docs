import { Demo } from './demo/Demo'
import { DrawerPlayground } from '@/examples/drawer/DrawerPlayground'
export function DrawerDemo() {
  return (
    <Demo
      title="Edit project settings"
      files={['drawer/DrawerExample.tsx']}
    >
      <DrawerPlayground task="settings" />
    </Demo>
  )
}
export function DrawerOutlineDemo() {
  return (
    <Demo
      title="Read a report outline"
      files={['drawer/DrawerExample.tsx']}
    >
      <DrawerPlayground task="outline" />
    </Demo>
  )
}
export function DrawerOrderDemo() {
  return (
    <Demo
      title="Review an order"
      files={['drawer/DrawerExample.tsx']}
    >
      <DrawerPlayground task="order" />
    </Demo>
  )
}
export function DrawerControlledDemo() {
  return (
    <Demo
      title="Open at a set size"
      files={['drawer/DrawerExample.tsx']}
    >
      <DrawerPlayground task="controlled" />
    </Demo>
  )
}
