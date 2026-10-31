'use client'

import { useState, type ReactNode } from 'react'
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellSkipLink,
  Sidebar,
  SidebarTrigger
} from '@cognitap/radiant'
import type { NavigationGroup } from '@/lib/navigation'
import { Navigation } from './Navigation'
import { SiteFooter, SiteHeaderContent } from './SiteChrome'

export function DocsShell({
  groups,
  children
}: {
  groups: NavigationGroup[]
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <AppShell
      mainId="content"
      open={open}
      onOpenChange={setOpen}
      className="docs-app"
    >
      <AppShellSkipLink>Skip to content</AppShellSkipLink>
      <AppShellHeader className="site-header">
        <SiteHeaderContent
          start={
            <SidebarTrigger
              variant="ghost"
              tone="neutral"
              iconOnly
              aria-label="Browse documentation"
              className="docs-sidebar-trigger"
            >
              <MenuIcon />
            </SidebarTrigger>
          }
        />
      </AppShellHeader>
      <Sidebar
        label="Documentation"
        closeLabel="Close"
        className="docs-sidebar"
      >
        <Navigation
          groups={groups}
          onNavigate={() => setOpen(false)}
        />
      </Sidebar>
      <AppShellMain className="docs-main">
        {children}
        <SiteFooter />
      </AppShellMain>
    </AppShell>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
