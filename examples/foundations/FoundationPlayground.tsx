'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { sharp, jelly, type ThemeMode } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls, SelectControl } from '@/components/demo/ActionControls'
import { garden, gardenWithButtonCorners } from './garden'

const FollowButton = dynamic(() => import('./FollowButton').then(module => module.FollowButton))
const ThemeExample = dynamic(() => import('./ThemeExample').then(module => module.ThemeExample))
const NestedScopes = dynamic(() => import('./NestedScopes').then(module => module.NestedScopes))

export type FoundationKind = 'setup' | 'presets' | 'authoring' | 'scopes'

export function FoundationPlayground({ kind }: { kind: FoundationKind }) {
  const [theme, setTheme] = useState(kind === 'scopes' ? jelly : sharp)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [buttonCorners, setButtonCorners] = useState(false)
  const [rounded, setRounded] = useState(true)
  return (
    <>
      {kind !== 'setup' && (
        <DemoControls>
          <div className="action-options">
            {kind === 'authoring' ? (
              <SelectControl
                label="Mode"
                value={mode}
                options={['light', 'dark', 'system']}
                onChange={setMode}
              />
            ) : (
              <PreviewThemeControls
                theme={theme}
                mode={mode}
                onThemeChange={setTheme}
                onModeChange={setMode}
              />
            )}
          </div>
          {kind === 'authoring' && (
            <label>
              <input
                type="checkbox"
                checked={buttonCorners}
                onChange={event => setButtonCorners(event.target.checked)}
              />
              Button-only corners
            </label>
          )}
          {kind === 'scopes' && (
            <label>
              <input
                type="checkbox"
                checked={rounded}
                onChange={event => setRounded(event.target.checked)}
              />
              Inline shared radius
            </label>
          )}
        </DemoControls>
      )}
      <DemoPreview>
        {kind === 'setup' ? (
          <FollowButton />
        ) : kind === 'scopes' ? (
          <NestedScopes
            theme={theme}
            mode={mode}
            rounded={rounded}
          />
        ) : (
          <ThemeExample
            theme={
              kind === 'authoring' ? (buttonCorners ? gardenWithButtonCorners : garden) : theme
            }
            mode={mode}
          />
        )}
      </DemoPreview>
    </>
  )
}
