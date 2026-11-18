'use client'
import { useState } from 'react'
import { Button, RingProgress } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'

export function TrackExport() {
  const [value, setValue] = useState(25)
  return (
    <MotionProvider>
      <div className="grid justify-items-center gap-4">
        <RingProgress
          aria-label="Export progress"
          value={value}
          label={value + '%'}
        />
        <Button
          onClick={() => setValue(value => Math.min(100, value + 25))}
          disabled={value >= 100}
        >
          Finish next file
        </Button>
      </div>
    </MotionProvider>
  )
}
