import { Demo } from './demo/Demo'
import { NavLinkPlayground } from '@/examples/navlink/NavLinkPlayground'
export function NavLinkDemo() {
  return (
    <Demo
      title="Browse a study workspace"
      files={['navlink/NavLinkExample.tsx']}
    >
      <NavLinkPlayground task="workspace" />
    </Demo>
  )
}
export function NavLinkProjectsDemo() {
  return (
    <Demo
      title="Browse a project library"
      files={['navlink/NavLinkExample.tsx']}
    >
      <NavLinkPlayground task="projects" />
    </Demo>
  )
}
export function NavLinkSettingsDemo() {
  return (
    <Demo
      title="Navigate team settings"
      files={['navlink/NavLinkExample.tsx']}
    >
      <NavLinkPlayground task="settings" />
    </Demo>
  )
}
