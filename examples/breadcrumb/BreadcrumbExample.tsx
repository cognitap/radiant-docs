'use client'
import { useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  ThemeScope,
  type ThemeMode
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PreviewThemeControls } from '@/components/demo/ActionControls'
import '@cognitap/radiant/styles.css'
export function BreadcrumbExample() {
  const [theme, setTheme] = useState(radiant)
  const [mode, setMode] = useState<ThemeMode>('light')
  const [currentLink, setCurrentLink] = useState(false)
  const [long, setLong] = useState(false)
  const title = long
    ? 'AnUnbrokenBreadcrumbPageTitleThatWrapsWithinTheAvailableSpace'
    : 'Breadcrumb'
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
            checked={currentLink}
            onChange={event => setCurrentLink(event.target.checked)}
          />{' '}
          Link the current page
        </label>
        <label>
          <input
            type="checkbox"
            checked={long}
            onChange={event => setLong(event.target.checked)}
          />{' '}
          Use long current title
        </label>
      </DemoControls>
      <DemoPreview>
        <ThemeScope
          theme={theme}
          mode={mode}
          style={{ width: '28rem', maxWidth: '100%', boxSizing: 'border-box', padding: '1.5rem' }}
        >
          <Breadcrumb aria-label="Documentation location">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/docs/installation/">Documentation</BreadcrumbLink>
                <BreadcrumbSeparator />
              </BreadcrumbItem>
              <BreadcrumbItem>
                {currentLink ? (
                  <BreadcrumbLink
                    href="/docs/breadcrumb/"
                    current
                  >
                    {title}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </ThemeScope>
      </DemoPreview>
    </>
  )
}
