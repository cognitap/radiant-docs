'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TableExample } from './TableExample'
export function TablePlayground() {
  const [wide, setWide] = useState(false)
  return (
    <>
      <DemoControls>
        <Checkbox
          label="Use wide columns"
          checked={wide}
          onChange={event => setWide(event.target.checked)}
        />
      </DemoControls>
      <DemoPreview>
        <TableExample wide={wide} />
      </DemoPreview>
    </>
  )
}
