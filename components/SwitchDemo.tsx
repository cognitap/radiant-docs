import { Demo } from './demo/Demo'
import { SwitchPlayground } from '@/examples/switch/SwitchPlayground'

export function SwitchDemo() {
  return (
    <Demo
      title="Make room for focus"
      files={['switch/SwitchExample.tsx']}
    >
      <SwitchPlayground task="focus" />
    </Demo>
  )
}

export function SwitchGroupDemo() {
  return (
    <Demo
      title="Group related settings"
      files={['switch/SwitchExample.tsx']}
    >
      <SwitchPlayground task="topics" />
    </Demo>
  )
}

export function SwitchFormDemo() {
  return (
    <Demo
      title="Save settings with a form"
      files={['switch/SwitchForm.tsx']}
    >
      <SwitchPlayground task="form" />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
