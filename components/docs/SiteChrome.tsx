import type { ReactNode } from 'react'
import NextLink from 'next/link'
import { radiantCandidate, radiantLabel } from '@/lib/radiant'
import { AppearanceControl } from './SiteTheme'
import { Search } from './Search'
import { RadiantMark } from './RadiantMark'
import { SiteLinks } from './SiteLinks'

/** The header's contents. `start` holds page-level controls such as the sidebar trigger. */
export function SiteHeaderContent({ start }: { start?: ReactNode }) {
  return (
    <>
      {start}
      <NextLink
        href="/"
        className="wordmark"
      >
        <RadiantMark />
        <span className="wordmark-text">Radiant</span>
      </NextLink>
      <nav
        aria-label="Site"
        className="site-tools"
      >
        <SiteLinks />
        <Search />
        <AppearanceControl />
      </nav>
      <span className="preview-label">{radiantLabel}</span>
    </>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      {radiantCandidate
        ? 'Local package preview · May include unpublished APIs'
        : 'Built with Radiant · Published package documentation'}
    </footer>
  )
}

/** Pages outside the documentation: one column with the site header and footer. */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="docs-shell">
      <a
        className="skip-link"
        href="#content"
      >
        Skip to content
      </a>
      <header className="site-header">
        <SiteHeaderContent />
      </header>
      {children}
      <SiteFooter />
    </div>
  )
}
