import type { ReactNode } from 'react'
import { getNavigation } from '@/lib/navigation'
import { MobileNavigation } from '@/components/docs/MobileNavigation'
import { Navigation } from '@/components/docs/Navigation'

export default function DocsLayout({ children }: { children: ReactNode }) {
  const groups = getNavigation()
  return (
    <>
      <div className="docs-mobile-bar">
        <MobileNavigation groups={groups} />
      </div>
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <Navigation groups={groups} />
        </aside>
        {children}
      </div>
    </>
  )
}
