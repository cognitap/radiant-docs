import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { radiantCandidate, radiantLabel } from '@/lib/radiant'
import NextLink from 'next/link'
import { AppearanceControl, SiteTheme } from '@/components/docs/SiteTheme'
import { Search } from '@/components/docs/Search'
import { RadiantMark } from '@/components/docs/RadiantMark'
import '@cognitap/radiant/styles.css'
import './styles.css'

export const metadata: Metadata = {
  title: { default: 'Radiant', template: '%s · Radiant' },
  description: 'React interaction components and presentation primitives.',
  robots: { index: false, follow: false }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteTheme>
          <div className="docs-shell">
            <a
              className="skip-link"
              href="#content"
            >
              Skip to content
            </a>
            <header className="site-header">
              <NextLink
                href="/"
                className="wordmark"
              >
                <RadiantMark />
                Radiant
              </NextLink>
              <nav
                aria-label="Site"
                className="site-tools"
              >
                <NextLink href="/docs/getting-started/">Documentation</NextLink>
                <NextLink href="/workshop/">Workshop</NextLink>
                <Search />
                <AppearanceControl />
              </nav>
              <span className="preview-label">{radiantLabel}</span>
            </header>
            {children}
            <footer className="site-footer">
              {radiantCandidate
                ? 'Local package preview · May include unpublished APIs'
                : 'Built with Radiant · Published package documentation'}
            </footer>
          </div>
        </SiteTheme>
      </body>
    </html>
  )
}
