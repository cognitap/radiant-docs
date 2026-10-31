'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { DrawerExample, type DrawerTask } from './DrawerExample'
import type { DrawerSide } from '@cognitap/radiant'
export function DrawerPlayground({ task = 'settings' }: { task?: DrawerTask }) {
  const [side, setSide] = useState<DrawerSide>(
      task === 'order' || task === 'controlled' ? 'bottom' : task === 'outline' ? 'start' : 'end'
    ),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [size, setSize] = useState(task === 'controlled' ? '0.5' : '1'),
    [off, setOff] = useState(false),
    [modal, setModal] = useState(task !== 'outline'),
    [backdrop, setBackdrop] = useState(true),
    [escape, setEscape] = useState(true),
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
            options={['top', 'right', 'bottom', 'left', 'start', 'end']}
            onChange={setSide}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Initial size"
            value={size}
            options={['0.5', '1']}
            onChange={setSize}
          />
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Modal"
            checked={modal}
            onChange={event => setModal(event.target.checked)}
          />
          <Checkbox
            label="Backdrop dismissal"
            checked={backdrop}
            onChange={event => setBackdrop(event.target.checked)}
          />
          <Checkbox
            label="Escape dismissal"
            checked={escape}
            onChange={event => setEscape(event.target.checked)}
          />
          <Checkbox
            label="Motion off"
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />
          <Checkbox
            label="Initially open"
            checked={initial}
            onChange={event => setInitial(event.target.checked)}
          />
          <Checkbox
            label="Disabled actions"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          <Checkbox
            label="Pending actions"
            checked={pending}
            onChange={event => setPending(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <DrawerExample
          key={String(initial) + size}
          task={task}
          initialOpen={initial}
          initialSize={Number(size)}
          side={side}
          dir={dir}
          modal={modal}
          closeOnBackdrop={backdrop}
          closeOnEscape={escape}
          disabled={disabled}
          pending={pending}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
