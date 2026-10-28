import { Demo } from './demo/Demo'
import { RadioPlayground } from '@/examples/radio/RadioPlayground'

export function RadioPlanDemo() {
  return (
    <Demo
      title="A plan for your next chapter"
      files={['radio/RadioExamples.tsx']}
    >
      <RadioPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function RadioIndicatorDemo() {
  return (
    <Demo
      title="Radio selection lab"
      files={['radio/RadioExamples.tsx']}
    >
      <RadioPlayground states />
    </Demo>
  )
}
