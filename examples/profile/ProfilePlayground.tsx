'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
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
        <div className="recipe-options">
          <label>
            Form owner
            <select
              value={owner}
              onChange={event => {
                if (event.target.value === 'native' || event.target.value === 'tanstack')
                  setOwner(event.target.value)
              }}
            >
              <option value="native">Native React</option>
              <option value="tanstack">TanStack Form</option>
            </select>
          </label>
          <label>
            Placement
            <select
              value={placement}
              onChange={event => {
                const value = event.target.value
                if (value === 'standalone' || value === 'card' || value === 'dialog')
                  setPlacement(value)
              }}
            >
              <option value="standalone">Standalone</option>
              <option value="card">Card</option>
              <option value="dialog">Dialog</option>
            </select>
          </label>
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
