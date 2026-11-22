'use client'
import { useState } from 'react'
import { Stack } from '@cognitap/radiant'
import { A2uiSurface, type A2uiActionPayload, type CatalogDiagnostic } from '@cognitap/radiant/a2ui'
import { reviewPlanMessages } from './reviewPlan'

export function AgentSurfaceExample() {
  const [sent, setSent] = useState('')
  const [diagnostics, setDiagnostics] = useState<CatalogDiagnostic[]>([])

  function handleAction(action: A2uiActionPayload) {
    // Send the action to your agent; here it is only shown.
    setSent(`${action.action} ${JSON.stringify(action.context)}`)
  }

  return (
    <Stack>
      <A2uiSurface
        surfaceId="review_plan"
        messages={reviewPlanMessages}
        onAction={handleAction}
        onDiagnostic={diagnostic => setDiagnostics(list => [...list, diagnostic])}
      />
      <output style={{ overflowWrap: 'anywhere' }}>
        {sent ? `Sent to agent: ${sent}` : 'No action sent yet.'}
      </output>
      <output aria-label="Diagnostics">
        {diagnostics.map(diagnostic => `${diagnostic.nodeId}: ${diagnostic.reason}`).join('\n')}
      </output>
    </Stack>
  )
}
