'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { BreadcrumbExample } from './BreadcrumbExample'

export function BreadcrumbPlayground() {
  const [currentLink, setCurrentLink] = useState(false)
  const [long, setLong] = useState(false)

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
          long={long}
        />
      </DemoPreview>
    </>
  )
}
