'use client'

import { useState } from 'react'
import { Checkbox } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { CodeBlockExample } from './CodeBlockExample'

export function CodeBlockPlayground() {
  const [lineNumbers, setLineNumbers] = useState(false)
  return (
    <>
      <DemoControls>
        <Checkbox
          label="Line numbers"
          checked={lineNumbers}
          onChange={event => setLineNumbers(event.currentTarget.checked)}
        />
      </DemoControls>
      <DemoPreview>
        <CodeBlockExample lineNumbers={lineNumbers} />
      </DemoPreview>
    </>
  )
}
