'use client'

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './breadcrumb-example.css'

const ancestors = [
  { href: '/docs/getting-started/', label: 'Documentation' },
  { href: '/docs/foundations/', label: 'Foundations' },
  { href: '/docs/foundations/composition/', label: 'Composition' },
  { href: '/docs/nav-link/', label: 'Navigation' },
  { href: '/docs/link/', label: 'Link' },
  { href: '/docs/breadcrumb/', label: 'Breadcrumb' }
]

export function LongTrailExample() {
  return (
    <div className="breadcrumb-example breadcrumb-narrow">
      <Breadcrumb aria-label="Long trail">
        <BreadcrumbList>
          {ancestors.map(item => (
            <BreadcrumbItem key={item.href}>
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>Wrapping a long location trail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
