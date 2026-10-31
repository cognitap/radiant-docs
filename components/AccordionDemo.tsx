import { Demo } from './demo/Demo'
import { AccordionPlayground } from '@/examples/accordion/AccordionPlayground'
const files = ['accordion/AccordionExample.tsx', 'profile/useHydrated.ts']
export function AccordionDemo() {
  return (
    <Demo
      title="Good questions. Clear answers."
      files={files}
    >
      <AccordionPlayground />
    </Demo>
  )
}
export function AccordionMultipleDemo() {
  return (
    <Demo
      title="Open several sections"
      files={files}
    >
      <AccordionPlayground task="multiple" />
    </Demo>
  )
}
export function AccordionControlledDemo() {
  return (
    <Demo
      title="Control the open section"
      files={files}
    >
      <AccordionPlayground task="controlled" />
    </Demo>
  )
}
export function AccordionDisabledDemo() {
  return (
    <Demo
      title="Disable an item"
      files={files}
    >
      <AccordionPlayground task="disabled" />
    </Demo>
  )
}
