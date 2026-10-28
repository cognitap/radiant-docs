'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const RouterLinkExample = dynamic(() =>
  import('./RouterLinkExample').then(module => module.RouterLinkExample)
)

export function RouterLinkPlayground() {
  const [newTab, setNewTab] = useState(false)
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
            checked={newTab}
            onChange={event => setNewTab(event.target.checked)}
          />
          Open in a new tab
        </label>
      </DemoControls>
      <DemoPreview>
        <RouterLinkExample
          newTab={newTab}
          theme={theme}
          mode={mode}
        />
      </DemoPreview>
    </>
  )
}
