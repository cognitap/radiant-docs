'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PopoverExample, type PopoverTask } from './PopoverExample'
import type { PopoverContentProps } from '@cognitap/radiant'
type Side = NonNullable<PopoverContentProps['side']>
type Align = NonNullable<PopoverContentProps['align']>
export function PopoverPlayground({ task = 'delivery' }: { task?: PopoverTask }) {
  const placement = task === 'placement'
  const [side, setSide] = useState<Side>(placement ? 'top' : 'bottom'),
    [align, setAlign] = useState<Align>(placement ? 'center' : 'start'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [sideOffset, setSideOffset] = useState(placement ? 12 : 8),
    [collisionPadding, setCollisionPadding] = useState(8),
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
            Side offset
            <input
              type="number"
              min="0"
              value={sideOffset}
              onChange={event => setSideOffset(Math.max(0, Number(event.target.value)))}
            />
          </label>
          <label>
            Collision padding
            <input
              type="number"
              min="0"
              value={collisionPadding}
              onChange={event => setCollisionPadding(Math.max(0, Number(event.target.value)))}
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
        <PopoverExample
          key={String(initial)}
          task={task}
          defaultOpen={initial}
          side={side}
          align={align}
          dir={dir}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
