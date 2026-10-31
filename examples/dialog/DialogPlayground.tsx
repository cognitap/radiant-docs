'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { DialogExample, type DialogTask } from './DialogExample'
const widths = { narrow: '24rem', standard: '32rem', wide: '40rem' }
export function DialogPlayground({ task = 'shortcuts' }: { task?: DialogTask }) {
  const [width, setWidth] = useState<keyof typeof widths>('standard'),
    [modal, setModal] = useState(true),
    [backdrop, setBackdrop] = useState(true),
    [escape, setEscape] = useState(true),
    [off, setOff] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Width"
            value={width}
            options={['narrow', 'standard', 'wide']}
            onChange={setWidth}
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
        </div>
      </DemoControls>
      <DemoPreview>
        <DialogExample
          task={task}
          modal={modal}
          closeOnBackdrop={backdrop}
          closeOnEscape={escape}
          motion={off ? 'off' : 'inherit'}
          style={{ '--rad-dialog-width': widths[width] }}
        />
      </DemoPreview>
    </>
  )
}
