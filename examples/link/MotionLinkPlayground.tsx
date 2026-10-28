'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  radiant,
  type ButtonVariant,
  type Tone,
  type ControlSize,
  type ThemeMode
} from '@cognitap/radiant'
import { PreviewThemeControls, SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const MotionLinkExample = dynamic(() =>
  import('./MotionLinkExample').then(module => module.MotionLinkExample)
)

export function MotionLinkPlayground() {
  const [variant, setVariant] = useState<ButtonVariant>('solid')
  const [tone, setTone] = useState<Tone>('accent')
  const [controlSize, setControlSize] = useState<ControlSize>('large')
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [off, setOff] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Variant"
            value={variant}
            options={['solid', 'soft', 'outline', 'ghost']}
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
            checked={off}
            onChange={event => setOff(event.target.checked)}
          />{' '}
          Turn off spatial motion
        </label>
      </DemoControls>
      <DemoPreview>
        <MotionLinkExample
          variant={variant}
          tone={tone}
          controlSize={controlSize}
          theme={theme}
          mode={mode}
          motion={off ? 'off' : 'inherit'}
        />
      </DemoPreview>
    </>
  )
}
