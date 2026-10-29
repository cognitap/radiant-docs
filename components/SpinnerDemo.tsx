import { Demo } from './demo/Demo'
import { SpinnerExample } from '@/examples/spinner/SpinnerExample'
export function SpinnerDemo() {
  return (
    <Demo
      title="Account loading"
      files={['spinner/SpinnerExample.tsx']}
    >
      <SpinnerExample />
    </Demo>
  )
}
