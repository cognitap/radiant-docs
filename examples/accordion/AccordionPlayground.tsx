'use client'
import { useState } from 'react'
import { ThemeScope } from '@cognitap/radiant'
import { DemoControls, DemoPreview, usePreviewMotionTheme } from '@/components/demo/DemoFrame'
import { AccordionExample, type AccordionTask } from './AccordionExample'
export function AccordionPlayground({ task = 'guide' }: { task?: AccordionTask }) {
  const [off, setOff] = useState(false),
    [disabled, setDisabled] = useState(false),
    theme = usePreviewMotionTheme(off)
  return (
    <>
      <DemoControls>
        <div className="action-toggles">
          <label>
            <input
              type="checkbox"
              checked={off}
              onChange={event => setOff(event.target.checked)}
            />
            Motion off
          </label>
          {task === 'disabled' && (
            <label>
              <input
                type="checkbox"
                checked={disabled}
                onChange={event => setDisabled(event.target.checked)}
              />
              Disable every item
            </label>
          )}
        </div>
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          style={{ minWidth: 0, maxWidth: '100%' }}
        >
          <AccordionExample
            task={task}
            disabled={disabled}
          />
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
