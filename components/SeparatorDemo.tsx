import { Demo } from './demo/Demo'
import { SeparatorPlayground } from '@/examples/separator/SeparatorPlayground'
export function SeparatorDemo() {
  return (
    <Demo
      title="Settings sections"
      files={['separator/SeparatorExample.tsx']}
    >
      <SeparatorPlayground />
    </Demo>
  )
}
export function SeparatorActionsDemo() {
  return (
    <Demo
      title="Divide a button row"
      files={['separator/SeparatorExample.tsx']}
    >
      <SeparatorPlayground task="actions" />
    </Demo>
  )
}
export function SeparatorHeadingDemo() {
  return (
    <Demo
      title="Underline a heading"
      files={['separator/SeparatorExample.tsx']}
    >
      <SeparatorPlayground task="heading" />
    </Demo>
  )
}
