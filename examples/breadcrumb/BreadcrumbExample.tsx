'use client'
import { useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
export function BreadcrumbExample() {
  const [currentLink, setCurrentLink] = useState(false)
  const [long, setLong] = useState(false)
  const title = long
    ? 'AnUnbrokenBreadcrumbPageTitleThatWrapsWithinTheAvailableSpace'
    : 'Breadcrumb'
  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={currentLink}
            onChange={event => setCurrentLink(event.target.checked)}
          />{' '}
          Link the current page
        </label>
        <label>
          <input
            type="checkbox"
            checked={long}
            onChange={event => setLong(event.target.checked)}
          />{' '}
          Use long current title
        </label>
      </DemoControls>
      <DemoPreview>
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
      </DemoPreview>
    </>
  )
}
