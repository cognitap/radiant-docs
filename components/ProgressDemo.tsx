import { Demo } from './demo/Demo'
import { ProgressExample } from '@/examples/progress/ProgressExample'
export function ProgressDemo() {
  return (
    <Demo
      title="Export progress"
      files={['progress/ProgressExample.tsx']}
    >
      <ProgressExample />
    </Demo>
  )
}
