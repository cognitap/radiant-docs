import { Demo } from './demo/Demo'
import { AgentSurfacePlayground } from '@/examples/agents/AgentSurfacePlayground'
export function AgentsDemo() {
  return (
    <Demo
      title="Render an agent's reply"
      files={['agents/AgentSurfaceExample.tsx']}
    >
      <AgentSurfacePlayground />
    </Demo>
  )
}
