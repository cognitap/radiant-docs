'use client'
import { Button, Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import type { SpinnerProps } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { LoadAccount, LoadReportPreview, RefreshResults } from './SpinnerExample'
export type SpinnerTask = 'account' | 'report' | 'refresh'
export function SpinnerPlayground({ task = 'account' }: { task?: SpinnerTask }) {
  const [controlSize, setSize] = useState<NonNullable<SpinnerProps['controlSize']>>(
      task === 'report' ? 'large' : task === 'refresh' ? 'small' : 'medium'
    ),
    [motionOff, setMotionOff] = useState(false),
    [standalone, setStandalone] = useState(false),
    [loaded, setLoaded] = useState(false),
    options = { controlSize, motion: motionOff ? ('off' as const) : ('inherit' as const) }
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
        </div>
        <div className="action-toggles">
          {task === 'account' && (
            <Checkbox
              label="Standalone indicator"
              checked={standalone}
              onChange={event => setStandalone(event.target.checked)}
            />
          )}
          <Checkbox
            label="Disable indicator motion"
            checked={motionOff}
            onChange={event => setMotionOff(event.target.checked)}
          />
        </div>
        {task === 'account' && (
          <div className="action-toggles">
            <Button
              variant="outline"
              controlSize="small"
              disabled={loaded}
              onClick={() => setLoaded(true)}
            >
              Simulate account loaded
            </Button>
            <Button
              variant="outline"
              controlSize="small"
              disabled={!loaded}
              onClick={() => setLoaded(false)}
            >
              Reload account
            </Button>
          </div>
        )}
      </DemoControls>
      <DemoPreview>
        {task === 'report' ? (
          <LoadReportPreview {...options} />
        ) : task === 'refresh' ? (
          <RefreshResults {...options} />
        ) : (
          <LoadAccount
            {...options}
            loaded={loaded}
            standalone={standalone}
          />
        )}
      </DemoPreview>
    </>
  )
}
