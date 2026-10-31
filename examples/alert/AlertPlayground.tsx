'use client'
import { Button } from '@cognitap/radiant'
import { useState } from 'react'
import type { AlertAnnouncement, AlertTone } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { Maintenance, RenewPlan, SaveFeedback, Tones } from './AlertExample'
export type AlertTask = 'maintenance' | 'tones' | 'action' | 'save'
export function AlertPlayground({ task = 'maintenance' }: { task?: AlertTask }) {
  const [tone, setTone] = useState<AlertTone>('neutral'),
    [announce, setAnnounce] = useState<AlertAnnouncement>('off'),
    [failed, setFailed] = useState(false),
    [urgent, setUrgent] = useState(false)
  return (
    <>
      <DemoControls>
        {task === 'maintenance' && (
          <div className="action-options">
            <SelectControl
              label="Tone"
              value={tone}
              options={['neutral', 'accent', 'warning', 'danger']}
              onChange={setTone}
            />
            <SelectControl
              label="Announce"
              value={announce}
              options={['off', 'polite', 'assertive']}
              onChange={setAnnounce}
            />
          </div>
        )}
        {task === 'save' && (
          <>
            <Button
              variant="outline"
              controlSize="small"
              onClick={() => setFailed(true)}
            >
              Simulate connection error
            </Button>
            <Button
              variant="outline"
              controlSize="small"
              onClick={() => setUrgent(true)}
            >
              Simulate urgent interruption
            </Button>
          </>
        )}
      </DemoControls>
      <DemoPreview>
        {task === 'tones' ? (
          <Tones />
        ) : task === 'action' ? (
          <RenewPlan />
        ) : task === 'save' ? (
          <SaveFeedback
            failed={failed}
            urgent={urgent}
          />
        ) : (
          <Maintenance
            tone={tone}
            announce={announce}
          />
        )}
      </DemoPreview>
    </>
  )
}
