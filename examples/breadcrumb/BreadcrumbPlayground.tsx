'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { BreadcrumbExample } from './BreadcrumbExample'
import { LongTrailExample } from './LongTrailExample'
import { RouterBreadcrumbExample } from './RouterBreadcrumbExample'
import { SeparatorExample } from './SeparatorExample'

export type BreadcrumbTask = 'location' | 'long-trail' | 'router' | 'separator'

const tasks = {
  'long-trail': LongTrailExample,
  router: RouterBreadcrumbExample,
  separator: SeparatorExample
}

export function BreadcrumbPlayground({ task = 'location' }: { task?: BreadcrumbTask }) {
  const [currentLink, setCurrentLink] = useState(false)
  const [long, setLong] = useState(false)
  if (task !== 'location') {
    const Example = tasks[task]
    return (
      <DemoPreview>
        <Example />
      </DemoPreview>
    )
  }
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
        <BreadcrumbExample
          currentLink={currentLink}
          title={
            long ? 'AnUnbrokenBreadcrumbPageTitleThatWrapsWithinTheAvailableSpace' : 'Breadcrumb'
          }
        />
      </DemoPreview>
    </>
  )
}
