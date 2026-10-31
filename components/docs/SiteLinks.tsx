'use client'

import { usePathname } from 'next/navigation'
import { RouteLink } from './RouteLink'

const links = [
  { href: '/docs/getting-started/', section: '/docs/', label: 'Documentation' },
  { href: '/workshop/', section: '/workshop/', label: 'Workshop' }
]

export function SiteLinks() {
  const pathname = usePathname()
  return links.map(link => (
    <RouteLink
      key={link.href}
      href={link.href}
      variant="ghost"
      tone="neutral"
      controlSize="small"
      className="site-link"
      aria-current={pathname.startsWith(link.section) ? 'page' : undefined}
    >
      {link.label}
    </RouteLink>
  ))
}
