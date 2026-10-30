import { Demo } from './demo/Demo'
import { SeparatorPlayground } from '@/examples/separator/SeparatorPlayground'
export function SeparatorDemo() {
  return (
    <Demo
      title="Section separation"
      files={['separator/SeparatorExample.tsx']}
    >
      <SeparatorPlayground />
    </Demo>
  )
}
