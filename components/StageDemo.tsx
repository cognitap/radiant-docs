import { Demo } from './demo/Demo'
import { StagePlayground } from '@/examples/stage/StagePlayground'
export function StageDemo() {
  return (
    <Demo
      title="Frame a gradient widget"
      files={['stage/StageExample.tsx']}
    >
      <StagePlayground />
    </Demo>
  )
}
export function StageStreamingDemo() {
  return (
    <Demo
      title="Hold the body while content streams"
      files={['stage/StageExample.tsx']}
    >
      <StagePlayground task="streaming" />
    </Demo>
  )
}
