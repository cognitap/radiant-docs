'use client'
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
            <label>
              <input
                type="checkbox"
                checked={standalone}
                onChange={event => setStandalone(event.target.checked)}
              />
              Standalone indicator
            </label>
          )}
          <label>
            <input
              type="checkbox"
              checked={motionOff}
              onChange={event => setMotionOff(event.target.checked)}
            />
            Disable indicator motion
          </label>
        </div>
        {task === 'account' && (
          <div className="action-toggles">
            <button
              type="button"
              disabled={loaded}
              onClick={() => setLoaded(true)}
            >
              Simulate account loaded
            </button>
            <button
              type="button"
              disabled={!loaded}
              onClick={() => setLoaded(false)}
            >
              Reload account
            </button>
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
