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

export function BreadcrumbExample({
  currentLink = false,
  long = false
}: {
  currentLink?: boolean
  long?: boolean
}) {
  const title = long
    ? 'AnUnbrokenBreadcrumbPageTitleThatWrapsWithinTheAvailableSpace'
    : 'Breadcrumb'

  return (
    <div style={{ width: '28rem', maxWidth: '100%', boxSizing: 'border-box' }}>
      <Breadcrumb aria-label="Documentation location">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs/installation/">Documentation</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            {currentLink ? (
              <BreadcrumbLink
                href="/docs/breadcrumb/"
                current
              >
                {title}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{title}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
