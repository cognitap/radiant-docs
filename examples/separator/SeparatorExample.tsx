'use client'
import { useState } from 'react'
import { Separator, ThemeScope, type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import '@cognitap/radiant/styles.css'
export function SeparatorExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [decorative, setDecorative] = useState(false)
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  return (
    <>
      <DemoControls>
        <PreviewThemeControls
          theme={theme}
          mode={mode}
          onThemeChange={setTheme}
          onModeChange={setMode}
        />
        <label>
          <input
            type="checkbox"
            checked={decorative}
            onChange={event => setDecorative(event.target.checked)}
          />{' '}
          Decorative division
        </label>
        <label>
          Orientation{' '}
          <select
            value={orientation}
            onChange={event =>
              setOrientation(event.target.value === 'vertical' ? 'vertical' : 'horizontal')
            }
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          mode={mode}
          style={{
            display: 'flex',
            flexDirection: orientation === 'vertical' ? 'row' : 'column',
            gap: '1rem',
            width: '100%',
            maxWidth: '32rem',
            height: orientation === 'vertical' ? '12rem' : undefined,
            padding: '1rem',
            boxSizing: 'border-box'
          }}
        >
          <section style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
            <h3>Account details</h3>
            <p>Your name and email address.</p>
          </section>
          <Separator
            decorative={decorative}
            orientation={orientation}
          />
          <section style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
            <h3>Notification preferences</h3>
            <p>Choose which updates you receive.</p>
          </section>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
