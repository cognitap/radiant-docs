'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { themes, radiant, type ThemeMode } from '@cognitap/radiant'
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
  const [themeId, setThemeId] = useState(radiant.id)
  const [mode, setMode] = useState<ThemeMode>('light')

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
          <label>
            Theme
            <select
              value={themeId}
              onChange={event => setThemeId(event.target.value)}
            >
              {themes.map(theme => (
                <option
                  key={theme.id}
                  value={theme.id}
                >
                  {theme.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mode
            <select
              value={mode}
              onChange={event => {
                const value = event.target.value
                if (value === 'light' || value === 'dark' || value === 'system') setMode(value)
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
        </div>
      </DemoControls>
      <DemoPreview label="Profile recipe preview">
        <ProfileRecipe
          key={`${owner}:${placement}`}
          owner={owner}
          placement={placement}
          theme={themes.find(theme => theme.id === themeId) ?? radiant}
          mode={mode}
        />
      </DemoPreview>
    </div>
  )
}
