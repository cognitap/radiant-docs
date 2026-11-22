'use client'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { AgentSurfaceExample } from './AgentSurfaceExample'
export function AgentSurfacePlayground() {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <AgentSurfaceExample />
      </DemoPreview>
    </>
  )
}
