'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { garden, gardenWithButtonCorners } from './garden'

const FollowButton = dynamic(() => import('./FollowButton').then(module => module.FollowButton))
const ThemeExample = dynamic(() => import('./ThemeExample').then(module => module.ThemeExample))
const NestedScopes = dynamic(() => import('./NestedScopes').then(module => module.NestedScopes))

export type FoundationKind = 'setup' | 'presets' | 'authoring' | 'scopes'

export function FoundationPlayground({ kind }: { kind: FoundationKind }) {
  const [buttonCorners, setButtonCorners] = useState(false)
  const [rounded, setRounded] = useState(true)
  return (
    <>
      {kind !== 'setup' && (
        <DemoControls>
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
          <NestedScopes rounded={rounded} />
        ) : (
          <ThemeExample
            theme={
              kind === 'authoring' ? (buttonCorners ? gardenWithButtonCorners : garden) : undefined
            }
          />
        )}
      </DemoPreview>
    </>
  )
}
