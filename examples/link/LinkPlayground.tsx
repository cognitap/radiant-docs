'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type LinkVariant, type Tone, type ControlSize, type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { PreviewThemeControls, SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const LinkExample = dynamic(() => import('./LinkExample').then(module => module.LinkExample))

export function LinkPlayground() {
  const [variant, setVariant] = useState<LinkVariant>('inline')
  const [tone, setTone] = useState<Tone>('accent')
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [external, setExternal] = useState(false)

  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Variant"
            value={variant}
            options={['inline', 'subtle', 'solid', 'soft', 'outline', 'ghost']}
            onChange={setVariant}
          />
          <SelectControl
            label="Tone"
            value={tone}
            options={['accent', 'neutral', 'warning', 'danger']}
            onChange={setTone}
          />
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setControlSize}
          />
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
            checked={external}
            onChange={event => setExternal(event.target.checked)}
          />
          Open in a new tab
        </label>
      </DemoControls>
      <DemoPreview>
        <LinkExample
          variant={variant}
          tone={tone}
          controlSize={controlSize}
          external={external}
          theme={theme}
          mode={mode}
        />
      </DemoPreview>
    </>
  )
}
