import { Demo } from './demo/Demo'
import { SeparatorExample } from '@/examples/separator/SeparatorExample'
export function SeparatorDemo() {
  return (
    <Demo
      title="Section separation"
      files={['separator/SeparatorExample.tsx']}
    >
      <SeparatorExample />
    </Demo>
  )
}
