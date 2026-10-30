import { Demo } from './demo/Demo'
import { TabsPlayground } from '@/examples/tabs/TabsPlayground'
const files = ['tabs/TabsExample.tsx', 'profile/useHydrated.ts']
export function TabsDemo() {
  return (
    <Demo
      title="Your workspace, your way"
      files={files}
    >
      <TabsPlayground task="workspace" />
      <noscript className="demo-feedback">
        Enable JavaScript to switch tabs or save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}
export function TabsReportsDemo() {
  return (
    <Demo
      title="Load reports on demand"
      files={files}
    >
      <TabsPlayground task="reports" />
    </Demo>
  )
}
export function TabsAccountDemo() {
  return (
    <Demo
      title="Put the list beside the panels"
      files={files}
    >
      <TabsPlayground task="account" />
    </Demo>
  )
}
export function TabsStagesDemo() {
  return (
    <Demo
      title="Scroll a long tab list"
      files={files}
    >
      <TabsPlayground task="stages" />
    </Demo>
  )
}
