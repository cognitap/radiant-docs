'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { MenuExample, type MenuTask } from './MenuExample'
import type { MenuContentProps } from '@cognitap/radiant'
export function MenuPlayground({ task = 'file' }: { task?: MenuTask }) {
  const [side, setSide] = useState<NonNullable<MenuContentProps['side']>>('bottom'),
    [align, setAlign] = useState<NonNullable<MenuContentProps['align']>>('start'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [off, setOff] = useState(false),
    [initial, setInitial] = useState(false),
    [disabled, setDisabled] = useState(false),
    [pending, setPending] = useState(false)
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
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
            Disabled trigger
          </label>
          <label>
            <input
              type="checkbox"
              checked={pending}
              onChange={event => setPending(event.target.checked)}
            />
            Pending trigger
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <MenuExample
          key={String(initial)}
          task={task}
          initialOpen={initial}
          side={side}
          align={align}
          dir={dir}
          disabled={disabled}
          pending={pending}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
