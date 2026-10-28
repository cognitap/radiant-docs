import { Demo } from './demo/Demo'
import { AccordionPlayground } from '@/examples/accordion/AccordionPlayground'

export function AccordionGuideDemo() {
  return (
    <Demo
      title="The field guide"
      files={['accordion/AccordionExamples.tsx']}
    >
      <AccordionPlayground />
      <noscript className="demo-feedback">
        Enable JavaScript for coordinated selection. Source is available below.
      </noscript>
    </Demo>
  )
}

export function AccordionSelectionDemo() {
  return (
    <Demo
      title="Accordion selection lab"
      files={['accordion/AccordionExamples.tsx']}
    >
      <AccordionPlayground states />
    </Demo>
  )
}
