'use client'

import { useState } from 'react'
import {
  Button,
  Input,
  ThemeScope,
  defaultTheme,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './foundation-example.css'

export function NestedScopes({
  theme,
  mode,
  rounded
}: {
  theme: Theme
  mode: ThemeMode
  rounded: boolean
}) {
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      style={rounded ? { '--rad-control-radius': '1.5rem' } : undefined}
      className="foundation-example foundation-scopes"
    >
      <ScopePanel label="Outer theme" />
      <ThemeScope
        mode="dark"
        className="foundation-scope"
      >
        <ScopePanel label="Same theme, dark mode" />
      </ThemeScope>
      <ThemeScope
        theme={defaultTheme}
        className="foundation-scope"
      >
        <ScopePanel label="Default theme reset" />
      </ThemeScope>
    </ThemeScope>
  )
}

function ScopePanel({ label }: { label: string }) {
  const [count, setCount] = useState(0)
  const ready = useHydrated()
  return (
    <section
      className="foundation-stack"
      aria-label={label}
    >
      <h3 className="foundation-heading">{label}</h3>
      <Input
        aria-label={`${label} note`}
        defaultValue="State stays here"
      />
      <Button
        disabled={!ready}
        onClick={() => setCount(value => value + 1)}
      >
        Count: {count}
      </Button>
    </section>
  )
}
