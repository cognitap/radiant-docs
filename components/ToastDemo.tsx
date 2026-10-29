import { Demo } from './demo/Demo'
import { ToastExample } from '@/examples/toast/ToastExample'
export function ToastDemo() {
  return (
    <Demo
      title="Queued draft notifications"
      files={['toast/ToastExample.tsx']}
    >
      <ToastExample />
    </Demo>
  )
}
