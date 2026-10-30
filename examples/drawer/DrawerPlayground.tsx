'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { DrawerExample, type DrawerTask } from './DrawerExample'
import type { DrawerSide } from '@cognitap/radiant'
export function DrawerPlayground({ task = 'settings' }: { task?: DrawerTask }) {
  const [side, setSide] = useState<DrawerSide>(
      task === 'order' ? 'bottom' : task === 'outline' ? 'start' : 'end'
    ),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [size, setSize] = useState('1'),
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
          <label>
            <input
              type="checkbox"
              checked={modal}
              onChange={event => setModal(event.target.checked)}
            />
            Modal
          </label>
          <label>
            <input
              type="checkbox"
              checked={backdrop}
              onChange={event => setBackdrop(event.target.checked)}
            />
            Backdrop dismissal
          </label>
          <label>
            <input
              type="checkbox"
              checked={escape}
              onChange={event => setEscape(event.target.checked)}
            />
            Escape dismissal
          </label>
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
            Disabled actions
          </label>
          <label>
            <input
              type="checkbox"
              checked={pending}
              onChange={event => setPending(event.target.checked)}
            />
            Pending actions
          </label>
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
