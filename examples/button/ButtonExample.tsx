'use client'

import { useState } from 'react'
import {
  Button,
  ThemeScope,
  radiant,
  type ButtonProps,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './button-example.css'

export function ButtonExample({
  disabled = false,
  pending = false,
  variant = 'solid',
  tone = 'accent',
  controlSize = 'medium',
  theme = radiant,
  mode = 'light'
}: Pick<ButtonProps, 'disabled' | 'pending' | 'variant' | 'tone' | 'controlSize'> & {
  theme?: Theme
  mode?: ThemeMode
}) {
  const [count, setCount] = useState(0)

  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="button-example"
    >
      <Button
        disabled={disabled}
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
    </ThemeScope>
  )
}
