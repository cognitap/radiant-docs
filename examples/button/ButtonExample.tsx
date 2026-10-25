'use client'

import { useState } from 'react'
import { Button } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './button-example.css'

export function ButtonExample({ disabled = false }: { disabled?: boolean }) {
  const [count, setCount] = useState(0)

  return (
    <div className="button-example">
      <Button
        disabled={disabled}
        onClick={() => setCount(value => value + 1)}
      >
        Try Radiant
      </Button>
      <output>
        {count === 0
          ? 'Ready when you are.'
          : `Activated ${count} ${count === 1 ? 'time' : 'times'}.`}
      </output>
    </div>
  )
}
