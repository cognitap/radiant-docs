import { Demo } from './demo/Demo'
import { AlertPlayground } from '@/examples/alert/AlertPlayground'
export function AlertDemo() {
  return (
    <Demo
      title="Scheduled maintenance"
      files={['alert/AlertExample.tsx']}
    >
      <AlertPlayground />
    </Demo>
  )
}
export function AlertTonesDemo() {
  return (
    <Demo
      title="Match the tone to the message"
      files={['alert/AlertExample.tsx']}
    >
      <AlertPlayground task="tones" />
    </Demo>
  )
}
export function AlertActionDemo() {
  return (
    <Demo
      title="Offer an action"
      files={['alert/AlertExample.tsx']}
    >
      <AlertPlayground task="action" />
    </Demo>
  )
}
export function AlertSaveDemo() {
  return (
    <Demo
      title="Inline save feedback"
      files={['alert/AlertExample.tsx']}
    >
      <AlertPlayground task="save" />
    </Demo>
  )
}
