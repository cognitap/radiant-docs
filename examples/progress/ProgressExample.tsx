'use client'
import { useId, useState } from 'react'
import {
  Progress,
  Button,
  Alert,
  AlertDescription,
  ThemeScope,
  type ThemeMode
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import '@cognitap/radiant/styles.css'
export function ProgressExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [value, setValue] = useState(0)
  const [unknown, setUnknown] = useState(false)
  const id = useId()
  const complete = !unknown && value === 100
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
            checked={unknown}
            onChange={event => setUnknown(event.target.checked)}
          />{' '}
          Unknown remaining amount
        </label>
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          mode={mode}
          style={{
            display: 'grid',
            gap: '1rem',
            padding: '1rem',
            width: '100%',
            maxWidth: '32rem',
            boxSizing: 'border-box'
          }}
        >
          <section
            aria-label="Export package"
            aria-busy={!complete}
            style={{ display: 'grid', gap: '1rem' }}
          >
            <label htmlFor={id}>Export progress</label>
            <Progress
              id={id}
              value={unknown ? null : value}
            />
            <p>
              {unknown
                ? 'Preparing the export. The remaining amount is unknown.'
                : `${value} of 100 items prepared.`}
            </p>
          </section>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            <Button
              disabled={complete || unknown}
              onClick={() => setValue(number => Math.min(100, number + 25))}
            >
              Advance export
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => {
                setValue(0)
                setUnknown(false)
              }}
            >
              Reset export
            </Button>
          </div>
          <Alert
            announce="polite"
            tone="accent"
            aria-label="Export result"
            style={complete ? undefined : { padding: 0, borderWidth: 0 }}
          >
            {complete && <AlertDescription>Export complete.</AlertDescription>}
          </Alert>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
