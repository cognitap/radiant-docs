'use client'
import { useState } from 'react'
import { Badge, ThemeScope, type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import '@cognitap/radiant/styles.css'
const states = {
  draft: { label: 'Draft', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'accent' },
  attention: { label: 'Needs attention', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'danger' }
} as const
export function BadgeExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [status, setStatus] = useState<keyof typeof states>('draft')
  const [decorative, setDecorative] = useState(false)
  const selection = states[status]
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
          Release status{' '}
          <select
            value={status}
            onChange={event => {
              const value = event.target.value
              if (
                value === 'draft' ||
                value === 'approved' ||
                value === 'attention' ||
                value === 'blocked'
              )
                setStatus(value)
            }}
          >
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="attention">Needs attention</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={decorative}
            onChange={event => setDecorative(event.target.checked)}
          />{' '}
          Repeat meaning in adjacent text
        </label>
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          mode={mode}
          style={{ padding: '1.5rem', maxWidth: '100%' }}
        >
          <p>
            Release status: {decorative && <span>{selection.label} </span>}
            <Badge
              tone={selection.tone}
              decorative={decorative}
            >
              {selection.label}
            </Badge>
          </p>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
