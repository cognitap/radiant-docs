import { Demo } from './demo/Demo'
import { CollapsiblePlayground } from '@/examples/collapsible/CollapsiblePlayground'
const files = ['collapsible/CollapsibleExample.tsx', 'profile/useHydrated.ts']
export function CollapsibleDemo() {
  return (
    <Demo
      title="Check a shipment"
      files={files}
    >
      <CollapsiblePlayground task="shipment" />
    </Demo>
  )
}
export function CollapsibleNotesDemo() {
  return (
    <Demo
      title="Start with details open"
      files={files}
    >
      <CollapsiblePlayground task="notes" />
    </Demo>
  )
}
export function CollapsibleReviewDemo() {
  return (
    <Demo
      title="Open from another control"
      files={files}
    >
      <CollapsiblePlayground task="review" />
    </Demo>
  )
}
export function CollapsibleAnswersDemo() {
  return (
    <Demo
      title="Keep one answer open"
      files={files}
    >
      <CollapsiblePlayground task="answers" />
    </Demo>
  )
}
export function CollapsibleDeliveryDemo() {
  return (
    <Demo
      title="Fold advanced fields in a form"
      files={files}
    >
      <CollapsiblePlayground task="delivery" />
    </Demo>
  )
}
