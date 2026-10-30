import { Demo } from './demo/Demo'
import { CommandPlayground } from '@/examples/command/CommandPlayground'
export function CommandDemo() {
  return (
    <Demo
      title="Manage study projects"
      files={['command/CommandExample.tsx']}
    >
      <CommandPlayground task="projects" />
    </Demo>
  )
}
export function CommandNavigationDemo() {
  return (
    <Demo
      title="Navigate workspace"
      files={['command/CommandExample.tsx']}
    >
      <CommandPlayground task="navigation" />
    </Demo>
  )
}
export function CommandLookupDemo() {
  return (
    <Demo
      title="Find study report"
      files={['command/CommandExample.tsx']}
    >
      <CommandPlayground task="lookup" />
    </Demo>
  )
}
