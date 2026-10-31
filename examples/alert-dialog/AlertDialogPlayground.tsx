'use client'
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
          <label>
            <input
              type="checkbox"
              checked={escape}
              onChange={event => setEscape(event.target.checked)}
            />
            Escape dismissal
          </label>
          <label>
            <input
              type="checkbox"
              checked={off}
              onChange={event => setOff(event.target.checked)}
            />
            Motion off
          </label>
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
