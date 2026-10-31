'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { AlertDialogExample, type AlertDialogTask } from './AlertDialogExample'
export function AlertDialogPlayground({ task = 'discard' }: { task?: AlertDialogTask }) {
  const [escape, setEscape] = useState(true),
    [off, setOff] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-toggles">
          <Checkbox
            label="Escape dismissal"
            checked={escape}
            onChange={event => setEscape(event.target.checked)}
          />
          <Checkbox
            label="Motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <AlertDialogExample
          task={task}
          closeOnEscape={escape}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
