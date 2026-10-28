'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type ButtonVariant, type Tone, type ControlSize, type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { PreviewThemeControls, SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const ButtonExample = dynamic(() => import('./ButtonExample').then(module => module.ButtonExample))

export function ButtonPlayground({ defaultDisabled = false }: { defaultDisabled?: boolean }) {
  const [disabled, setDisabled] = useState(defaultDisabled)
  const [pending, setPending] = useState(false)
  const [variant, setVariant] = useState<ButtonVariant>('solid')
  const [tone, setTone] = useState<Tone>('accent')
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')

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
        <div className="action-toggles">
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
            Disabled
          </label>
          <label>
            <input
              type="checkbox"
              checked={pending}
              onChange={event => setPending(event.target.checked)}
            />
            Pending
          </label>
        </div>
      </DemoControls>
      <DemoPreview>
        <ButtonExample
          disabled={disabled}
          pending={pending}
          variant={variant}
          tone={tone}
          controlSize={controlSize}
          theme={theme}
          mode={mode}
        />
      </DemoPreview>
    </>
  )
}
