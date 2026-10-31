import { Demo } from './demo/Demo'
import { SpinnerPlayground } from '@/examples/spinner/SpinnerPlayground'
export function SpinnerDemo() {
  return (
    <Demo
      title="Account loading"
      files={['spinner/SpinnerExample.tsx']}
    >
      <SpinnerPlayground />
    </Demo>
  )
}
export function SpinnerReportDemo() {
  return (
    <Demo
      title="Load a report preview"
      files={['spinner/SpinnerExample.tsx']}
    >
      <SpinnerPlayground task="report" />
    </Demo>
  )
}
export function SpinnerRefreshDemo() {
  return (
    <Demo
      title="Refresh results in place"
      files={['spinner/SpinnerExample.tsx']}
    >
      <SpinnerPlayground task="refresh" />
    </Demo>
  )
}
