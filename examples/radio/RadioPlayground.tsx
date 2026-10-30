'use client'
import { useState } from 'react'
import { ThemeScope, type ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview, usePreviewMotionTheme } from '@/components/demo/DemoFrame'
import { RadioExample, type RadioTask } from './RadioExample'
export function RadioPlayground({ task = 'plan' }: { task?: RadioTask }) {
  const [controlSize, setControlSize] = useState<ControlSize>('medium'),
    [off, setOff] = useState(false),
    theme = usePreviewMotionTheme(off)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setControlSize}
          />
        </div>
        {task === 'plan' && (
          <div className="action-toggles">
            <label>
              <input
                type="checkbox"
                checked={off}
                onChange={event => setOff(event.target.checked)}
              />
              Motion off
            </label>
          </div>
        )}
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          style={{ minWidth: 0, maxWidth: '100%' }}
        >
          <RadioExample
            task={task}
            controlSize={controlSize}
          />
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
