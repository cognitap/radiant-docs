'use client'
import { useState } from 'react'
import {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuContent,
  MenuItem,
  ThemeScope,
  type ThemeMode
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import '@cognitap/radiant/styles.css'
export function MenuExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [copies, setCopies] = useState(0)
  const [archived, setArchived] = useState(false)
  return (
    <>
      <DemoControls>
        <PreviewThemeControls
          theme={theme}
          mode={mode}
          onThemeChange={setTheme}
          onModeChange={setMode}
        />
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          mode={mode}
          style={{ display: 'grid', gap: '1rem', padding: '1rem' }}
        >
          <p>Studio notes · local draft</p>
          <Menu>
            <MenuTrigger variant="outline">Draft commands</MenuTrigger>
            <MenuPortal>
              <MenuContent>
                <MenuItem onSelect={() => setCopies(value => value + 1)}>Duplicate draft</MenuItem>
                <MenuItem disabled>Publish · owner only</MenuItem>
                <MenuItem onSelect={() => setArchived(value => !value)}>
                  {archived ? 'Restore draft' : 'Archive draft'}
                </MenuItem>
              </MenuContent>
            </MenuPortal>
          </Menu>
          <output>
            {archived ? 'Archived' : 'Active'} · {copies} local {copies === 1 ? 'copy' : 'copies'}
          </output>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
