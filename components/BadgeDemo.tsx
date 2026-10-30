import { Demo } from './demo/Demo'
import { BadgeExample } from '@/examples/badge/BadgeExample'
export function BadgeDemo() {
  return (
    <Demo
      title="Release category"
      files={['badge/BadgeExample.tsx']}
    >
      <BadgeExample />
    </Demo>
  )
}
