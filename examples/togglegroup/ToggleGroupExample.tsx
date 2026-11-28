'use client'

import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'

export function ToggleGroupExample() {
  const [alignment, setAlignment] = useState<string | null>('left')

  return (
    <MotionProvider>
      <div style={{ display: 'grid', gap: '1rem', width: '20rem', maxWidth: '100%' }}>
        <ToggleGroup
          aria-label="Text alignment"
          variant="segmented"
          value={alignment}
          onValueChange={setAlignment}
        >
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
        <p
          style={{
            margin: 0,
            textAlign: alignment === 'center' || alignment === 'right' ? alignment : 'left'
          }}
        >
          Project notes
        </p>
      </div>
    </MotionProvider>
  )
}
