'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { PaginationExample } from './PaginationExample'

export function PaginationPlayground() {
  const [compact, setCompact] = useState(false)

  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={compact}
            onChange={event => setCompact(event.target.checked)}
          />{' '}
          Compact spacing
        </label>
      </DemoControls>
      <DemoPreview>
        <PaginationExample compact={compact} />
      </DemoPreview>
    </>
  )
}
