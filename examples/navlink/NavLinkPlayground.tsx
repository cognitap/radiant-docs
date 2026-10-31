'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { NavLinkExample, type NavLinkTask } from './NavLinkExample'
import type { ControlSize } from '@cognitap/radiant'
export function NavLinkPlayground({ task = 'workspace' }: { task?: NavLinkTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [icons, setIcons] = useState(true),
    [descriptions, setDescriptions] = useState(true)
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
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Icons"
            checked={icons}
            onChange={e => setIcons(e.target.checked)}
          />
          <Checkbox
            label="Descriptions"
            checked={descriptions}
            onChange={e => setDescriptions(e.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <NavLinkExample
          task={task}
          controlSize={size}
          dir={dir}
          icons={icons}
          descriptions={descriptions}
        />
      </DemoPreview>
    </>
  )
}
