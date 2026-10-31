'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { ThemeScope, type ThemeMode } from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'

const AppearanceContext = createContext<{
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
} | null>(null)

export function SiteTheme({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  return (
    <AppearanceContext.Provider value={{ mode, setMode }}>
      <ThemeScope
        theme={radiant}
        mode={mode}
        className="site-theme"
        data-docs-mode={mode}
      >
        {children}
      </ThemeScope>
    </AppearanceContext.Provider>
  )
}

export function AppearanceControl() {
  const appearance = useContext(AppearanceContext)
  if (!appearance) throw new Error('AppearanceControl needs SiteTheme.')
  return (
    <label className="appearance-control">
      <span className="appearance-label">Appearance</span>
      <select
        value={appearance.mode}
        onChange={event => {
          const mode = event.target.value
          if (mode === 'light' || mode === 'dark' || mode === 'system') appearance.setMode(mode)
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  )
}
