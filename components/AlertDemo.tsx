import { Demo } from './demo/Demo'
import { AlertExample } from '@/examples/alert/AlertExample'
export function AlertDemo() {
  return (
    <Demo
      title="Inline save feedback"
      files={['alert/AlertExample.tsx']}
    >
      <AlertExample />
    </Demo>
  )
}
