import { Demo } from './demo/Demo'
import { BadgePlayground } from '@/examples/badge/BadgePlayground'
export function BadgeDemo() {
  return (
    <Demo
      title="Release category"
      files={['badge/BadgeExample.tsx']}
    >
      <BadgePlayground />
    </Demo>
  )
}
