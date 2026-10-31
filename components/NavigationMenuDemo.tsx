import { Demo } from './demo/Demo'
import { NavigationMenuPlayground } from '@/examples/navigation-menu/NavigationMenuPlayground'
export function NavigationMenuDemo() {
  return (
    <Demo
      title="Find study materials"
      files={['navigation-menu/NavigationMenuExample.tsx']}
    >
      <NavigationMenuPlayground task="library" />
    </Demo>
  )
}
export function NavigationMenuHelpDemo() {
  return (
    <Demo
      title="Find help resources"
      files={['navigation-menu/NavigationMenuExample.tsx']}
    >
      <NavigationMenuPlayground task="help" />
    </Demo>
  )
}
export function NavigationMenuWorkspaceDemo() {
  return (
    <Demo
      title="Switch research workspaces"
      files={['navigation-menu/NavigationMenuExample.tsx']}
    >
      <NavigationMenuPlayground task="workspace" />
    </Demo>
  )
}
