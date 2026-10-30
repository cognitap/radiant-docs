'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { HoverCardExample, type HoverCardTask } from './HoverCardExample'
import type { HoverCardContentProps } from '@cognitap/radiant'
export function HoverCardPlayground({ task = 'contributor' }: { task?: HoverCardTask }) {
  const [side, setSide] = useState<NonNullable<HoverCardContentProps['side']>>('bottom'),
    [align, setAlign] = useState<NonNullable<HoverCardContentProps['align']>>('start'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [openDelay, setOpenDelay] = useState(500),
    [closeDelay, setCloseDelay] = useState(150),
    [off, setOff] = useState(false),
    [initial, setInitial] = useState(false)
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
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
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
          <label>
            <input
              type="checkbox"
              checked={initial}
              onChange={event => setInitial(event.target.checked)}
            />
            Initially open
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <HoverCardExample
          key={String(initial)}
          task={task}
          defaultOpen={initial}
          side={side}
          align={align}
          dir={dir}
          openDelay={openDelay}
          closeDelay={closeDelay}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
