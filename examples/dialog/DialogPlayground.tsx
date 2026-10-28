'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const Profile = dynamic(() =>
  import('./DialogExamples').then(module => module.DialogProfileExample)
)
const Transition = dynamic(() =>
  import('./DialogExamples').then(module => module.DialogTransitionExample)
)

export function DialogPlayground({ states = false }: { states?: boolean }) {
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
      </DemoControls>
      <DemoPreview>
        {states ? (
          <Transition
            theme={theme}
            mode={mode}
          />
        ) : (
          <Profile
            theme={theme}
            mode={mode}
          />
        )}
      </DemoPreview>
    </>
  )
}
