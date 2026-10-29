import { Demo } from './demo/Demo'
import { SkeletonExample } from '@/examples/skeleton/SkeletonExample'
export function SkeletonDemo() {
  return (
    <Demo
      title="Account placeholders"
      files={['skeleton/SkeletonExample.tsx']}
    >
      <SkeletonExample />
    </Demo>
  )
}
