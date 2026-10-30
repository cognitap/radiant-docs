import { Demo } from './demo/Demo'
import { ProgressPlayground } from '@/examples/progress/ProgressPlayground'
export function ProgressDemo() {
  return (
    <Demo
      title="Export progress"
      files={['progress/ProgressExample.tsx']}
    >
      <ProgressPlayground />
    </Demo>
  )
}
