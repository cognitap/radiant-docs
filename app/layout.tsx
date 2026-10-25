import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { radiantCandidate, radiantLabel } from '@/lib/radiant'
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
        <div className="docs-shell">
          <a
            className="skip-link"
            href="#content"
          >
            Skip to content
          </a>
          <header className="site-header">
            <a
              href="/"
              className="wordmark"
            >
              Radiant<span aria-hidden="true"> ✳</span>
            </a>
            <span className="preview-label">{radiantLabel}</span>
          </header>
          <main id="content">{children}</main>
          <footer className="site-footer">
            {radiantCandidate
              ? 'Local package preview · May include unpublished APIs'
              : 'Built with Radiant · Published package documentation'}
          </footer>
        </div>
      </body>
    </html>
  )
}
