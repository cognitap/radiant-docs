'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { radiant, type ThemeMode } from '@cognitap/radiant'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const Dashboard = dynamic(() =>
  import('./CardExamples').then(module => module.CardDashboardExample)
)

export function CardPlayground({ states = false }: { states?: boolean }) {
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
        <Dashboard
          theme={theme}
          mode={mode}
          staticMotion={states}
        />
      </DemoPreview>
    </>
  )
}
