'use client'

import { useState } from 'react'
import { Button, ButtonGroup } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'

export function ButtonGroupExample() {
  const [week, setWeek] = useState(0)

  return (
    <MotionProvider>
      <div style={{ display: 'grid', justifyItems: 'start', gap: '0.5rem' }}>
        <ButtonGroup aria-label="Browse weeks">
          <Button
            variant="outline"
            onClick={() => setWeek(value => value - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setWeek(0)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            onClick={() => setWeek(value => value + 1)}
          >
            Next
          </Button>
        </ButtonGroup>
        <output>{week === 0 ? 'This week' : `Week ${week > 0 ? '+' : ''}${week}`}</output>
      </div>
    </MotionProvider>
  )
}
