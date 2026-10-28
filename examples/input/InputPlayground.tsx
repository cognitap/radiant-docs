'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type ControlSize, type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { PreviewThemeControls, SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const InputProfileExample = dynamic(() =>
  import('./InputProfileExample').then(module => module.InputProfileExample)
)

export function InputPlayground() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
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
      </DemoControls>
      <DemoPreview>
        <InputProfileExample
          theme={theme}
          mode={mode}
          controlSize={controlSize}
        />
      </DemoPreview>
    </>
  )
}
