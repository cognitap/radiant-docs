import { Demo } from './demo/Demo'
import { CardPlayground } from '@/examples/card/CardPlayground'
const files = ['card/CardExample.tsx', 'card/card-example.css']
export function CardDemo() {
  return (
    <Demo
      title="Post a studio note"
      files={files}
    >
      <CardPlayground />
    </Demo>
  )
}
export function CardActionsDemo() {
  return (
    <Demo
      title="Track a shipment"
      files={files}
    >
      <CardPlayground task="actions" />
    </Demo>
  )
}
export function CardLinkDemo() {
  return (
    <Demo
      title="Open a project from its card"
      files={files}
    >
      <CardPlayground task="link" />
    </Demo>
  )
}
