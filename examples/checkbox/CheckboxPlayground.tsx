'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ThemeScope,
  radiant,
  type ControlSize,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { PreviewThemeControls, SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const Permissions = dynamic(() =>
  import('./CheckboxExamples').then(module => module.CheckboxPermissionsExample)
)
const States = dynamic(() =>
  import('./CheckboxExamples').then(module => module.CheckboxStatePlayground)
)

export function CheckboxPlayground({ states = false }: { states?: boolean }) {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  const [off, setOff] = useState(false)
  const selected = useMemo<Theme>(
    () => ({ ...theme, motion: { ...theme.motion, mode: off ? 'off' : theme.motion.mode } }),
    [theme, off]
  )
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <PreviewThemeControls
            theme={theme}
            mode={mode}
            onThemeChange={setTheme}
            onModeChange={setMode}
          />
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
            mode={mode}
            style={{ minWidth: 0, maxWidth: '100%' }}
          >
            <States controlSize={controlSize} />
          </ThemeScope>
        ) : (
          <Permissions
            theme={theme}
            mode={mode}
            controlSize={controlSize}
          />
        )}
      </DemoPreview>
    </>
  )
}
