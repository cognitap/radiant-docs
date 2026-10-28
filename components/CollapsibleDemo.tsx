import { Demo } from './demo/Demo'
import { CollapsiblePlayground } from '@/examples/collapsible/CollapsiblePlayground'

export function CollapsibleSettingsDemo() {
  return (
    <Demo
      title="A quieter inbox"
      files={['collapsible/CollapsibleExamples.tsx']}
    >
      <CollapsiblePlayground />
      <noscript className="demo-feedback">
        Enable JavaScript to save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function CollapsibleHeightDemo() {
  return (
    <Demo
      title="Collapsible height lab"
      files={['collapsible/CollapsibleExamples.tsx']}
    >
      <CollapsiblePlayground states />
    </Demo>
  )
}
