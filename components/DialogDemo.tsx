import { Demo } from './demo/Demo'
import { DialogPlayground } from '@/examples/dialog/DialogPlayground'
export function DialogDemo() {
  return (
    <Demo
      title="Review keyboard shortcuts"
      files={['dialog/DialogExample.tsx']}
    >
      <DialogPlayground task="shortcuts" />
    </Demo>
  )
}
export function DialogProfileDemo() {
  return (
    <Demo
      title="Edit a profile"
      files={['dialog/DialogExample.tsx']}
    >
      <DialogPlayground task="profile" />
    </Demo>
  )
}
export function DialogOrdersDemo() {
  return (
    <Demo
      title="Open one dialog from many rows"
      files={['dialog/DialogExample.tsx']}
    >
      <DialogPlayground task="orders" />
    </Demo>
  )
}
export function DialogPolicyDemo() {
  return (
    <Demo
      title="Read a long policy"
      files={['dialog/DialogExample.tsx']}
    >
      <DialogPlayground task="policy" />
    </Demo>
  )
}
