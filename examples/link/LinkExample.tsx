'use client'

import { Link, type LinkProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './link-example.css'

export type LinkTask = 'guide' | 'prose'

export function LinkExample({
  task = 'guide',
  variant = 'inline',
  tone = 'accent',
  controlSize = 'medium',
  external = false
}: Pick<LinkProps, 'variant' | 'tone' | 'controlSize' | 'external'> & { task?: LinkTask }) {
  if (task === 'prose')
    return (
      <article className="link-example link-prose">
        <p>
          Radiant styles native elements. Start with the{' '}
          <Link
            href="/docs/getting-started/"
            variant={variant}
            tone={tone}
          >
            installation guide
          </Link>
          , then choose a theme in{' '}
          <Link
            href="/docs/foundations/"
            variant={variant}
            tone={tone}
          >
            system foundations
          </Link>
          .
        </p>
        <nav aria-label="Related pages">
          <Link
            href="/docs/button/"
            variant="subtle"
            tone="neutral"
          >
            Button
          </Link>
          <Link
            href="/docs/nav-link/"
            variant="subtle"
            tone="neutral"
          >
            NavLink
          </Link>
        </nav>
      </article>
    )
  return (
    <div className="link-example">
      <Link
        href="/docs/getting-started/"
        variant={variant}
        tone={tone}
        controlSize={controlSize}
        external={external}
      >
        Read the installation guide{external ? ' (opens in a new tab)' : ''}
      </Link>
      <p>This is a real destination. Use your browser’s Back action to return.</p>
    </div>
  )
}
