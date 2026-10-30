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
