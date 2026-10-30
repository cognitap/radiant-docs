'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TooltipExample, type TooltipTask } from './TooltipExample'
import type { TooltipContentProps } from '@cognitap/radiant'
export function TooltipPlayground({ task = 'draft' }: { task?: TooltipTask }) {
  const [side, setSide] = useState<NonNullable<TooltipContentProps['side']>>('top'),
    [align, setAlign] = useState<NonNullable<TooltipContentProps['align']>>('center'),
    [openDelay, setOpenDelay] = useState(500),
    [closeDelay, setCloseDelay] = useState(150),
    [off, setOff] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Side"
            value={side}
            options={['top', 'right', 'bottom', 'left']}
            onChange={setSide}
          />
          <SelectControl
            label="Align"
            value={align}
            options={['start', 'center', 'end']}
            onChange={setAlign}
          />
          <label>
            Open delay
            <input
              type="number"
              min="0"
              value={openDelay}
              onChange={event => setOpenDelay(Math.max(0, Number(event.target.value)))}
            />
          </label>
          <label>
            Close delay
            <input
              type="number"
              min="0"
              value={closeDelay}
              onChange={event => setCloseDelay(Math.max(0, Number(event.target.value)))}
            />
          </label>
        </div>
        <div className="action-toggles">
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
        <TooltipExample
          task={task}
          side={side}
          align={align}
          openDelay={openDelay}
          closeDelay={closeDelay}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
