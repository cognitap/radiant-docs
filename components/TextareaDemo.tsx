import { Demo } from './demo/Demo'
import { TextareaDraftExample } from '@/examples/textarea/TextareaExample'

export function TextareaDemo() {
  return (
    <Demo
      title="Introduce your workspace"
      files={['textarea/TextareaExample.tsx', 'profile/useHydrated.ts']}
    >
      <TextareaDraftExample />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
