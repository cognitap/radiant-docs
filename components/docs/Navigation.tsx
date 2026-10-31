'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { NavLink } from '@cognitap/radiant'
import type { NavigationGroup } from '@/lib/navigation'

export function Navigation({
  groups,
  onNavigate
}: {
  groups: NavigationGroup[]
  onNavigate: () => void
}) {
  const pathname = usePathname().replace(/\/$/, '')
  return groups.map(group => (
    <section
      key={group.title}
      className="docs-navigation"
    >
      <h3>{group.title}</h3>
      <ul>
        {group.pages.map(page => (
          <li key={page.url}>
            <NavLink
              href={page.url}
              active={pathname === page.url.replace(/\/$/, '')}
              controlSize="small"
              render={props => (
                <NextLink
                  {...props}
                  href={page.url}
                />
              )}
              onClick={onNavigate}
            >
              {page.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </section>
  ))
}
