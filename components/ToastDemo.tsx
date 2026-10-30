import { Demo } from './demo/Demo'
import { ToastPlayground } from '@/examples/toast/ToastPlayground'
export function ToastDemo() {
  return (
    <Demo
      title="Pause sync"
      files={['toast/ToastExample.tsx']}
    >
      <ToastPlayground />
    </Demo>
  )
}
export function ToastSaveDemo() {
  return (
    <Demo
      title="Confirm a save"
      files={['toast/ToastExample.tsx']}
    >
      <ToastPlayground task="save" />
    </Demo>
  )
}
export function ToastUndoDemo() {
  return (
    <Demo
      title="Undo a deletion"
      files={['toast/ToastExample.tsx']}
    >
      <ToastPlayground task="undo" />
    </Demo>
  )
}
export function ToastErrorDemo() {
  return (
    <Demo
      title="Report a failed upload"
      files={['toast/ToastExample.tsx']}
    >
      <ToastPlayground task="error" />
    </Demo>
  )
}
export function ToastQueueDemo() {
  return (
    <Demo
      title="Queued draft notifications"
      files={['toast/ToastExample.tsx']}
    >
      <ToastPlayground task="queue" />
    </Demo>
  )
}
