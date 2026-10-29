'use client'

import { useState } from 'react'
import {
  ThemeScope,
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  type ThemeMode
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import '@cognitap/radiant/styles.css'

export function TooltipExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [saved, setSaved] = useState(false)
  return (
    <>
      <DemoControls>
        <PreviewThemeControls
          theme={theme}
          mode={mode}
          onThemeChange={setTheme}
          onModeChange={setMode}
        />
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          mode={mode}
          style={{ padding: '1rem', display: 'grid', gap: '1rem' }}
        >
          <p>Save this draft to your workspace. Publishing is a separate action.</p>
          <Tooltip>
            <TooltipTrigger onClick={() => setSaved(true)}>Save draft</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent>This draft stays private until you publish it.</TooltipContent>
            </TooltipPortal>
          </Tooltip>
          <output>{saved ? 'Draft saved locally.' : 'Unsaved draft.'}</output>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
