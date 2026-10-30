'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const RouterLinkExample = dynamic(() =>
  import('./RouterLinkExample').then(module => module.RouterLinkExample)
)

export function RouterLinkPlayground() {
  const [newTab, setNewTab] = useState(false)
  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={newTab}
            onChange={event => setNewTab(event.target.checked)}
          />
          Open in a new tab
        </label>
      </DemoControls>
      <DemoPreview>
        <RouterLinkExample newTab={newTab} />
      </DemoPreview>
    </>
  )
}
