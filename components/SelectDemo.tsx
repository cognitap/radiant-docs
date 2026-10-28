import { Demo } from './demo/Demo'
import { SelectSettingsExample } from '@/examples/select/SelectExamples'

export function SelectDemo() {
  return (
    <Demo
      title="Your workspace"
      files={['select/SelectExamples.tsx']}
    >
      <SelectSettingsExample />
    </Demo>
  )
}
