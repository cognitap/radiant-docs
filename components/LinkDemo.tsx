import { LinkExample } from '@/examples/link/LinkExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function LinkDemo() {
  return (
    <Demo
      title="Navigate to a page"
      files={['link/LinkExample.tsx']}
      reset={false}
    >
      <DemoControls />
      <DemoPreview>
        <LinkExample />
      </DemoPreview>
    </Demo>
  )
}
