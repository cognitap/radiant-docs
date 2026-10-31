'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { Link } from '@cognitap/radiant'

const links = [
  { href: '/docs/getting-started/', section: '/docs/', label: 'Documentation' },
  { href: '/workshop/', section: '/workshop/', label: 'Workshop' }
]

export function SiteLinks() {
  const pathname = usePathname()
  return links.map(link => (
    <Link
      key={link.href}
      href={link.href}
      variant="ghost"
      tone="neutral"
      controlSize="small"
      className="site-link"
      aria-current={pathname.startsWith(link.section) ? 'page' : undefined}
      render={props => (
        <NextLink
          {...props}
          href={link.href}
        />
      )}
    >
      {link.label}
    </Link>
  ))
}
