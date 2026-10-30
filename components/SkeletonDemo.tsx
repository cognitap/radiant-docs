import { Demo } from './demo/Demo'
import { SkeletonPlayground } from '@/examples/skeleton/SkeletonPlayground'
export function SkeletonDemo() {
  return (
    <Demo
      title="Account placeholders"
      files={['skeleton/SkeletonExample.tsx']}
    >
      <SkeletonPlayground />
    </Demo>
  )
}
