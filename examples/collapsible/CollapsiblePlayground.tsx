'use client'
import { useState } from 'react'
import { ThemeScope } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview, usePreviewMotionTheme } from '@/components/demo/DemoFrame'
import { CollapsibleExample, type CollapsibleTask } from './CollapsibleExample'
export function CollapsiblePlayground({ task = 'shipment' }: { task?: CollapsibleTask }) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [off, setOff] = useState(false),
    [localOff, setLocalOff] = useState(false),
    theme = usePreviewMotionTheme(off)
  return (
    <>
      <DemoControls>
        <div className="action-options">
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
            Theme motion off
          </label>
          <label>
            <input
              type="checkbox"
              checked={localOff}
              onChange={event => setLocalOff(event.target.checked)}
            />
            Local motion off
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          style={{ minWidth: 0, maxWidth: '100%' }}
        >
          <CollapsibleExample
            task={task}
            dir={dir}
            motion={localOff ? 'off' : 'inherit'}
          />
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
