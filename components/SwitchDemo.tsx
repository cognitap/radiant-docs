import { Demo } from './demo/Demo'
import { SwitchSettingsExample } from '@/examples/switch/SwitchExample'

export function SwitchDemo() {
  return (
    <Demo
      title="Make room for focus"
      files={['switch/SwitchExample.tsx', 'profile/useHydrated.ts']}
    >
      <SwitchSettingsExample />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
