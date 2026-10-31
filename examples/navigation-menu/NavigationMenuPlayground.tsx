'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import type { ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { NavigationMenuExample, type NavigationTask } from './NavigationMenuExample'
export function NavigationMenuPlayground({ task = 'library' }: { task?: NavigationTask }) {
  const [controlSize, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [disabled, setDisabled] = useState(false),
    [motion, setMotion] = useState<'inherit' | 'off'>('inherit')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
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
            label="Disable dropdowns"
            checked={disabled}
            onChange={e => setDisabled(e.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <NavigationMenuExample
          task={task}
          controlSize={controlSize}
          dir={dir}
          disabled={disabled}
          motion={motion}
        />
      </DemoPreview>
    </>
  )
}
