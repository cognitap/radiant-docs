import { Demo } from './demo/Demo'
import { EmptyStatePlayground } from '@/examples/emptystate/EmptyStatePlayground'
export function EmptyStateDemo() {
  return (
    <Demo
      title="Create a study project"
      files={['emptystate/EmptyStateExample.tsx']}
    >
      <EmptyStatePlayground task="table" />
    </Demo>
  )
}
export function EmptyStateSearchDemo() {
  return (
    <Demo
      title="Find a study project"
      files={['emptystate/EmptyStateExample.tsx']}
    >
      <EmptyStatePlayground task="search" />
    </Demo>
  )
}
export function EmptyStateRecoveryDemo() {
  return (
    <Demo
      title="Recover study reports"
      files={['emptystate/EmptyStateExample.tsx']}
    >
      <EmptyStatePlayground task="recovery" />
    </Demo>
  )
}
