import { Demo } from './demo/Demo'
import { AgentSurfacePlayground } from '@/examples/agents/AgentSurfacePlayground'
import { SparklinePlayground } from '@/examples/agents/SparklinePlayground'
export function AgentsDemo() {
  return (
    <Demo
      title="Render an agent's reply"
      files={['agents/AgentSurfaceExample.tsx', 'agents/reviewPlan.ts']}
    >
      <AgentSurfacePlayground />
    </Demo>
  )
}
export function AgentsExtensionDemo() {
  return (
    <Demo
      title="Add a trend line to the catalog"
      files={['agents/SparklineExample.tsx']}
    >
      <SparklinePlayground />
    </Demo>
  )
}
