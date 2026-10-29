'use client'
import { useState } from 'react'
import {
  Skeleton,
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
export function SkeletonExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [loaded, setLoaded] = useState(false)
  const [motionOff, setMotionOff] = useState(false)
  const motion = motionOff ? 'off' : 'inherit'
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
            checked={motionOff}
            onChange={event => setMotionOff(event.target.checked)}
          />{' '}
          Disable placeholder motion
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
            style={{ minHeight: '10rem', display: 'grid', alignContent: 'center', gap: '1rem' }}
          >
            {loaded ? (
              <>
                <h3>Jordan Rivera</h3>
                <p>Email: jordan@example.com</p>
                <p>Weekly product updates are enabled.</p>
              </>
            ) : (
              <>
                <Skeleton
                  motion={motion}
                  style={{ width: '4rem', height: '4rem', borderRadius: '50%' }}
                />
                <Skeleton
                  motion={motion}
                  style={{ width: '70%' }}
                />
                <Skeleton motion={motion} />
                <Skeleton
                  motion={motion}
                  style={{ width: '55%' }}
                />
              </>
            )}
          </section>
          <Button onClick={() => setLoaded(value => !value)}>
            {loaded ? 'Reload account' : 'Simulate account loaded'}
          </Button>
          <Alert
            announce="polite"
            aria-label="Account loading status"
          >
            <AlertDescription>{loaded ? 'Account loaded.' : 'Loading account…'}</AlertDescription>
          </Alert>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
