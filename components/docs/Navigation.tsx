'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavigationGroup } from '@/lib/navigation'

export function Navigation({
  groups,
  onNavigate
}: {
  groups: NavigationGroup[]
  onNavigate?: () => void
}) {
  const pathname = usePathname().replace(/\/$/, '')
  return (
    <nav
      aria-label="Documentation"
      className="docs-navigation"
    >
      {groups.map(group => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <ul>
            {group.pages.map(page => (
              <li key={page.url}>
                <NextLink
                  href={page.url}
                  aria-current={pathname === page.url.replace(/\/$/, '') ? 'page' : undefined}
                  onClick={onNavigate}
                >
                  {page.title}
                </NextLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  )
}
