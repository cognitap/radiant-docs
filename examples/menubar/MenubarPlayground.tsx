'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { MenubarExample, type MenubarTask } from './MenubarExample'
import type { MenubarContentProps } from '@cognitap/radiant'
export function MenubarPlayground({ task = 'document' }: { task?: MenubarTask }) {
  const [side, setSide] = useState<NonNullable<MenubarContentProps['side']>>('bottom'),
    [align, setAlign] = useState<NonNullable<MenubarContentProps['align']>>('start'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [off, setOff] = useState(false),
    [loop, setLoop] = useState(true),
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
              checked={loop}
              onChange={event => setLoop(event.target.checked)}
            />
            Loop navigation
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
            Disabled commands
          </label>
          <label>
            <input
              type="checkbox"
              checked={pending}
              onChange={event => setPending(event.target.checked)}
            />
            Pending File menu
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <MenubarExample
          key={String(initial)}
          task={task}
          initialOpen={initial}
          side={side}
          align={align}
          dir={dir}
          loop={loop}
          disabled={disabled}
          pending={pending}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
