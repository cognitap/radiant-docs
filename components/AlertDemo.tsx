import { Demo } from './demo/Demo'
import { AlertPlayground } from '@/examples/alert/AlertPlayground'
export function AlertDemo() {
  return (
    <Demo
      title="Inline save feedback"
      files={['alert/AlertExample.tsx']}
    >
      <AlertPlayground />
    </Demo>
  )
}
