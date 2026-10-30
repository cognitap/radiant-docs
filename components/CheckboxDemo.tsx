import { Demo } from './demo/Demo'
import { CheckboxPlayground } from '@/examples/checkbox/CheckboxPlayground'

export function CheckboxDemo() {
  return (
    <Demo
      title="Choose notification channels"
      files={['checkbox/CheckboxExample.tsx']}
    >
      <CheckboxPlayground task="channels" />
    </Demo>
  )
}

export function CheckboxPermissionsDemo() {
  return (
    <Demo
      title="Select all permissions"
      files={['checkbox/CheckboxPermissions.tsx']}
    >
      <CheckboxPlayground task="permissions" />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function CheckboxConsentDemo() {
  return (
    <Demo
      title="Require consent"
      files={['checkbox/CheckboxExample.tsx']}
    >
      <CheckboxPlayground task="consent" />
    </Demo>
  )
}
