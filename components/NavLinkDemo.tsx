import { NavLinkExample } from '@/examples/navlink/NavLinkExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function NavLinkDemo() {
  return (
    <Demo
      title="Browse a workspace"
      files={['navlink/NavLinkExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <NavLinkExample />
      </DemoPreview>
    </Demo>
  )
}
