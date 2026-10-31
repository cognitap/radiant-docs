'use client'
import { Checkbox, Field, NumberField } from '@cognitap/radiant'
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
          <Field
            label="Open delay"
            className="demo-control"
          >
            <NumberField
              controlSize="small"
              min={0}
              value={openDelay}
              onValueChange={value => setOpenDelay(value ?? 0)}
            />
          </Field>
          <Field
            label="Close delay"
            className="demo-control"
          >
            <NumberField
              controlSize="small"
              min={0}
              value={closeDelay}
              onValueChange={value => setCloseDelay(value ?? 0)}
            />
          </Field>
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
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
