'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { radiant, type ThemeMode } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls } from '@/components/demo/ActionControls'

const ButtonComposition = dynamic(() =>
  import('./ButtonComposition').then(module => module.ButtonComposition)
)

export function ButtonCompositionPlayground() {
  const [pending, setPending] = useState(false)
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
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
        </div>
        <label>
          <input
            type="checkbox"
            checked={pending}
            onChange={event => setPending(event.target.checked)}
          />
          Pending
        </label>
      </DemoControls>
      <DemoPreview>
        <ButtonComposition
          pending={pending}
          theme={theme}
          mode={mode}
        />
      </DemoPreview>
    </>
  )
}
