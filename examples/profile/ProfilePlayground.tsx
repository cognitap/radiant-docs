'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import type { FormOwner, FormPlacement } from './ProfileRecipe'

const ProfileRecipe = dynamic(() => import('./ProfileRecipe').then(module => module.ProfileRecipe))

export function ProfilePlayground({
  compare = false,
  defaultPlacement
}: {
  compare?: boolean
  defaultPlacement?: FormPlacement
}) {
  const [owner, setOwner] = useState<FormOwner>(compare ? 'tanstack' : 'native')
  const [placement, setPlacement] = useState<FormPlacement>(
    defaultPlacement ?? (compare ? 'card' : 'standalone')
  )

  return (
    <div className="recipe-playground">
      <DemoControls label="Recipe options">
        <div className="action-options">
          <SelectControl
            label="Form owner"
            value={owner}
            options={['native', 'tanstack']}
            optionLabels={{ native: 'Native React', tanstack: 'TanStack Form' }}
            onChange={setOwner}
          />
          <SelectControl
            label="Placement"
            value={placement}
            options={['standalone', 'card', 'dialog']}
            optionLabels={{ standalone: 'Standalone', card: 'Card', dialog: 'Dialog' }}
            onChange={setPlacement}
          />
        </div>
      </DemoControls>
      <DemoPreview label="Profile recipe preview">
        <ProfileRecipe
          key={`${owner}:${placement}`}
          owner={owner}
          placement={placement}
        />
      </DemoPreview>
    </div>
  )
}
