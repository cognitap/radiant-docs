'use client'

import { Checkbox } from '@cognitap/radiant'
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
        <Checkbox
          label="Open in a new tab"
          checked={newTab}
          onChange={event => setNewTab(event.target.checked)}
        />
      </DemoControls>
      <DemoPreview>
        <RouterLinkExample newTab={newTab} />
      </DemoPreview>
    </>
  )
}
