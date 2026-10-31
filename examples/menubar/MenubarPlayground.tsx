'use client'
import { Checkbox } from '@cognitap/radiant'
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
          <Checkbox
            label="Motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
          <Checkbox
            label="Loop navigation"
            checked={loop}
            onChange={event => setLoop(event.target.checked)}
          />
          <Checkbox
            label="Initially open"
            checked={initial}
            onChange={event => setInitial(event.target.checked)}
          />
          <Checkbox
            label="Disabled commands"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          <Checkbox
            label="Pending File menu"
            checked={pending}
            onChange={event => setPending(event.target.checked)}
          />
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
