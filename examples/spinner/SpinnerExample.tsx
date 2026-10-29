'use client'
import { useState } from 'react'
import {
  Spinner,
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
export function SpinnerExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [loaded, setLoaded] = useState(false)
  const [standalone, setStandalone] = useState(false)
  const [motionOff, setMotionOff] = useState(false)
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
            checked={standalone}
            onChange={event => setStandalone(event.target.checked)}
          />{' '}
          Standalone indicator
        </label>
        <label>
          <input
            type="checkbox"
            checked={motionOff}
            onChange={event => setMotionOff(event.target.checked)}
          />{' '}
          Disable indicator motion
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
            aria-label="Account details"
            aria-busy={!loaded}
            style={{ minHeight: '5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}
          >
            {loaded ? (
              <p>Account: Jordan Rivera. Email preferences are ready.</p>
            ) : (
              <>
                <Spinner
                  label={standalone ? 'Loading account' : undefined}
                  motion={motionOff ? 'off' : 'inherit'}
                />
                {!standalone && <span>Loading account…</span>}
              </>
            )}
          </section>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            <Button
              disabled={loaded}
              onClick={() => setLoaded(true)}
            >
              Simulate account loaded
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              disabled={!loaded}
              onClick={() => setLoaded(false)}
            >
              Reload account
            </Button>
          </div>
          <Alert
            announce="polite"
            aria-label="Account result"
            style={loaded ? undefined : { padding: 0, borderWidth: 0 }}
          >
            {loaded && <AlertDescription>Account loaded.</AlertDescription>}
          </Alert>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
