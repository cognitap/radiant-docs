import { Demo } from './demo/Demo'
import { SliderPlayground } from '@/examples/slider/SliderPlayground'
export function SliderDemo() {
  return (
    <Demo
      title="Set listening preferences"
      files={['slider/SliderExample.tsx', 'profile/useHydrated.ts']}
    >
      <SliderPlayground />
    </Demo>
  )
}
export function SliderValueDemo() {
  return (
    <Demo
      title="Show the current value"
      files={['slider/SliderExample.tsx']}
    >
      <SliderPlayground task="value" />
    </Demo>
  )
}
export function SliderStepsDemo() {
  return (
    <Demo
      title="Label stepped marks"
      files={['slider/SliderExample.tsx']}
    >
      <SliderPlayground task="steps" />
    </Demo>
  )
}
