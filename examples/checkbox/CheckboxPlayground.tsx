'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ThemeScope, type ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import {
  DemoControls,
  DemoPreview,
  usePreviewMotionTheme,
  usePreviewTheme
} from '@/components/demo/DemoFrame'

const Permissions = dynamic(() =>
  import('./CheckboxExamples').then(module => module.CheckboxPermissionsExample)
)
const States = dynamic(() =>
  import('./CheckboxExamples').then(module => module.CheckboxStatePlayground)
)

export function CheckboxPlayground({ states = false }: { states?: boolean }) {
  const { theme } = usePreviewTheme()
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  const [off, setOff] = useState(false)
  const selected = usePreviewMotionTheme(off)
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
        {states && (
          <label>
            <input
              type="checkbox"
              checked={off}
              onChange={event => setOff(event.target.checked)}
            />{' '}
            Turn off spatial motion
          </label>
        )}
      </DemoControls>
      <DemoPreview>
        {states ? (
          <ThemeScope
            theme={selected}
            style={{ minWidth: 0, maxWidth: '100%' }}
          >
            <States controlSize={controlSize} />
          </ThemeScope>
        ) : (
          <Permissions
            controlSize={controlSize}
            theme={theme}
          />
        )}
      </DemoPreview>
    </>
  )
}
