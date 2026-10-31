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

export function BreadcrumbExample({
  currentLink = false,
  title = 'Breadcrumb'
}: {
  currentLink?: boolean
  title?: string
}) {
  return (
    <div className="breadcrumb-example">
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
