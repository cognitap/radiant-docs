import { Demo } from './demo/Demo'
import { NumberFieldPlayground } from '@/examples/numberfield/NumberFieldPlayground'
export function NumberFieldDemo() {
  return (
    <Demo
      title="Plan participant sessions"
      files={['numberfield/NumberFieldExample.tsx']}
    >
      <NumberFieldPlayground task="participants" />
    </Demo>
  )
}
export function NumberFieldBudgetDemo() {
  return (
    <Demo
      title="Calculate session budget"
      files={['numberfield/NumberFieldExample.tsx']}
    >
      <NumberFieldPlayground task="budget" />
    </Demo>
  )
}
export function NumberFieldTargetDemo() {
  return (
    <Demo
      title="Choose accuracy target"
      files={['numberfield/NumberFieldExample.tsx']}
    >
      <NumberFieldPlayground task="target" />
    </Demo>
  )
}
