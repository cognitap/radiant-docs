import { Demo } from './demo/Demo'
import { CheckboxPlayground } from '@/examples/checkbox/CheckboxPlayground'

export function CheckboxPermissionsDemo() {
  return (
    <Demo
      title="A clear set of permissions"
      files={['checkbox/CheckboxExamples.tsx']}
    >
      <CheckboxPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function CheckboxIndicatorDemo() {
  return (
    <Demo
      title="Checkbox indicator lab"
      files={['checkbox/CheckboxExamples.tsx']}
    >
      <CheckboxPlayground states />
    </Demo>
  )
}
