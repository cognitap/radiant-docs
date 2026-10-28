import { Demo } from './demo/Demo'
import { CardPlayground } from '@/examples/card/CardPlayground'

export function CardDashboardDemo() {
  return (
    <Demo
      title="Project dashboard"
      files={['card/CardExamples.tsx']}
    >
      <CardPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript for editing and layout controls. Source is available below.
      </noscript>
    </Demo>
  )
}

export function CardStaticDemo() {
  return (
    <Demo
      title="Static project cards"
      files={['card/CardExamples.tsx']}
    >
      <CardPlayground states />
    </Demo>
  )
}
