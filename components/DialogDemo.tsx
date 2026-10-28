import { Demo } from './demo/Demo'
import { DialogPlayground } from '@/examples/dialog/DialogPlayground'

export function DialogProfileDemo() {
  return (
    <Demo
      title="A profile worth sharing"
      files={['dialog/DialogExamples.tsx']}
    >
      <DialogPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function DialogTransitionDemo() {
  return (
    <Demo
      title="Dialog transition lab"
      files={['dialog/DialogExamples.tsx']}
    >
      <DialogPlayground states />
    </Demo>
  )
}
