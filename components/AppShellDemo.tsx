import { Demo } from './demo/Demo'
import { AppShellPlayground } from '@/examples/app-shell/AppShellPlayground'
export function AppShellDemo() {
  return (
    <Demo
      title="Review research sessions"
      files={['app-shell/AppShellExample.tsx']}
    >
      <AppShellPlayground task="sessions" />
    </Demo>
  )
}
export function AppShellNotesDemo() {
  return (
    <Demo
      title="Write research notes"
      files={['app-shell/AppShellExample.tsx']}
    >
      <AppShellPlayground task="notes" />
    </Demo>
  )
}
export function AppShellSavedDemo() {
  return (
    <Demo
      title="Restore a research layout"
      files={['app-shell/AppShellExample.tsx']}
    >
      <AppShellPlayground task="saved" />
    </Demo>
  )
}
