import { Demo } from './demo/Demo'
import { ToastPlayground } from '@/examples/toast/ToastPlayground'
export function ToastDemo() {
  return (
    <Demo
      title="Queued draft notifications"
      files={['toast/ToastExample.tsx']}
    >
      <ToastPlayground />
    </Demo>
  )
}
