'use client'
import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TableExample } from './TableExample'
export function TablePlayground() {
  const [wide, setWide] = useState(false)
  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={wide}
            onChange={event => setWide(event.target.checked)}
          />{' '}
          Use wide columns
        </label>
      </DemoControls>
      <DemoPreview>
        <TableExample wide={wide} />
      </DemoPreview>
    </>
  )
}
