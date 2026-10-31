import { Demo } from './demo/Demo'
import { AlertDialogPlayground } from '@/examples/alert-dialog/AlertDialogPlayground'
export function AlertDialogDemo() {
  return (
    <Demo
      title="Discard a draft"
      files={['alert-dialog/AlertDialogExample.tsx']}
    >
      <AlertDialogPlayground task="discard" />
    </Demo>
  )
}
export function AlertDialogDeleteDemo() {
  return (
    <Demo
      title="Confirm a deletion"
      files={['alert-dialog/AlertDialogExample.tsx']}
    >
      <AlertDialogPlayground task="delete" />
    </Demo>
  )
}
export function AlertDialogAsyncDemo() {
  return (
    <Demo
      title="Wait for an async action"
      files={['alert-dialog/AlertDialogExample.tsx']}
    >
      <AlertDialogPlayground task="async" />
    </Demo>
  )
}
export function AlertDialogControlledDemo() {
  return (
    <Demo
      title="Own the open state"
      files={['alert-dialog/AlertDialogExample.tsx']}
    >
      <AlertDialogPlayground task="controlled" />
    </Demo>
  )
}
