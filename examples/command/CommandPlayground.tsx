'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { CommandExample, type CommandTask } from './CommandExample'
import type { ControlSize } from '@cognitap/radiant'
export function CommandPlayground({ task = 'projects' }: { task?: CommandTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [motion, setMotion] = useState<'inherit' | 'off'>('inherit'),
    [disabled, setDisabled] = useState(false),
    [modal, setModal] = useState(true),
    [escape, setEscape] = useState(true),
    [backdrop, setBackdrop] = useState(true)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={size}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Motion"
            value={motion}
            options={['inherit', 'off']}
            onChange={setMotion}
          />
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Disabled trigger"
            checked={disabled}
            onChange={e => setDisabled(e.target.checked)}
          />
          <Checkbox
            label="Modal"
            checked={modal}
            onChange={e => setModal(e.target.checked)}
          />
          <Checkbox
            label="Close on Escape"
            checked={escape}
            onChange={e => setEscape(e.target.checked)}
          />
          <Checkbox
            label="Close on backdrop"
            checked={backdrop}
            onChange={e => setBackdrop(e.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <CommandExample
          task={task}
          controlSize={size}
          dir={dir}
          motion={motion}
          disabled={disabled}
          modal={modal}
          closeOnEscape={escape}
          closeOnBackdrop={backdrop}
        />
      </DemoPreview>
    </>
  )
}
