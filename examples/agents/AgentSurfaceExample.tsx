'use client'
import { useState } from 'react'
import { Stack } from '@cognitap/radiant'
import {
  A2UI_BASIC_CATALOG_ID,
  A2UI_PROTOCOL_VERSION,
  A2uiSurface,
  type A2uiActionPayload,
  type A2uiMessage,
  type CatalogDiagnostic
} from '@cognitap/radiant/a2ui'

/** A recorded agent reply. In your app, these messages arrive from your agent. */
export const reviewPlanMessages: readonly A2uiMessage[] = [
  {
    version: A2UI_PROTOCOL_VERSION,
    createSurface: {
      surfaceId: 'review_plan',
      catalogId: A2UI_BASIC_CATALOG_ID,
      dataModel: { plan: { topics: ['fractions'], length: ['20'] } },
      components: [
        { id: 'root', component: 'Column', children: ['intro', 'topics', 'length', 'start'] },
        {
          id: 'intro',
          component: 'Text',
          text: 'You missed two fraction questions yesterday. Plan a short review?'
        },
        {
          id: 'topics',
          component: 'ChoicePicker',
          label: 'Topics',
          variant: 'multipleSelection',
          displayStyle: 'chips',
          options: [
            { label: 'Fractions', value: 'fractions' },
            { label: 'Decimals', value: 'decimals' },
            { label: 'Percentages', value: 'percentages' }
          ],
          value: { '@path': '/plan/topics' }
        },
        {
          id: 'length',
          component: 'ChoicePicker',
          label: 'Length',
          options: [
            { label: '10 minutes', value: '10' },
            { label: '20 minutes', value: '20' }
          ],
          value: { '@path': '/plan/length' }
        },
        {
          id: 'start',
          component: 'Button',
          child: 'start_label',
          variant: 'primary',
          action: {
            event: {
              name: 'start_review',
              context: { topics: { '@path': '/plan/topics' }, length: { '@path': '/plan/length' } }
            }
          }
        },
        { id: 'start_label', component: 'Text', text: 'Start review' }
      ]
    }
  }
]

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
      {diagnostics.length > 0 && <output>{diagnostics.length} diagnostics reported.</output>}
    </Stack>
  )
}
