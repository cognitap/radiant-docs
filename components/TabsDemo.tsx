import { Demo } from './demo/Demo'
import { TabsWorkspaceExample } from '@/examples/tabs/TabsExample'

export function TabsDemo() {
  return (
    <Demo
      title="Your workspace, your way"
      files={['tabs/TabsExample.tsx', 'profile/useHydrated.ts']}
    >
      <TabsWorkspaceExample />
      <noscript className="demo-feedback">
        Enable JavaScript to switch tabs or save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
