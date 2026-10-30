'use client'

import { useState } from 'react'
import { Tooltip, TooltipTrigger, TooltipPortal, TooltipContent } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function TooltipExample() {
  const [saved, setSaved] = useState(false)

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <p>Save this draft to your workspace. Publishing is a separate action.</p>
      <Tooltip>
        <TooltipTrigger onClick={() => setSaved(true)}>Save draft</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>This draft stays private until you publish it.</TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <output>{saved ? 'Draft saved locally.' : 'Unsaved draft.'}</output>
    </div>
  )
}
