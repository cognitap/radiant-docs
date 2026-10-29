import { Demo } from './demo/Demo'
import { SliderSettingsExample } from '@/examples/slider/SliderExample'

export function SliderDemo() {
  return (
    <Demo
      title="Find your balance"
      files={['slider/SliderExample.tsx', 'profile/useHydrated.ts']}
    >
      <SliderSettingsExample />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
