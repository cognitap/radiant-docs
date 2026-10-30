'use client'

import { useState } from 'react'
import { Button, type ButtonProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './button-example.css'
import { useHydrated } from '../profile/useHydrated'

export function ButtonExample({
  disabled = false,
  pending = false,
  variant = 'solid',
  tone = 'accent',
  controlSize = 'medium'
}: Pick<ButtonProps, 'disabled' | 'pending' | 'variant' | 'tone' | 'controlSize'>) {
  const [count, setCount] = useState(0)
  const ready = useHydrated()

  return (
    <div className="button-example">
      <Button
        disabled={disabled || !ready}
        pending={pending}
        variant={variant}
        tone={tone}
        controlSize={controlSize}
        onClick={() => setCount(value => value + 1)}
      >
        Try Radiant
      </Button>
      <span className="button-state">
        {disabled
          ? 'Action unavailable.'
          : pending
            ? 'Working… activation is paused.'
            : 'Action available.'}
      </span>
      <output>
        {count === 0
          ? 'Ready when you are.'
          : `Activated ${count} ${count === 1 ? 'time' : 'times'}.`}
      </output>
    </div>
  )
}
