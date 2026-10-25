'use client'

import {
  Link,
  ThemeScope,
  radiant,
  type LinkProps,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './link-example.css'

export function LinkExample({
  variant = 'inline',
  tone = 'accent',
  controlSize = 'medium',
  external = false,
  theme = radiant,
  mode = 'light'
}: Pick<LinkProps, 'variant' | 'tone' | 'controlSize' | 'external'> & {
  theme?: Theme
  mode?: ThemeMode
}) {
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="link-example"
    >
      <Link
        href="/docs/getting-started/"
        variant={variant}
        tone={tone}
        controlSize={controlSize}
        external={external}
      >
        Read the installation guide{external ? ' (opens in a new tab)' : ''}
      </Link>
      <p>This is a real destination. Use your browser’s Back action to return.</p>
    </ThemeScope>
  )
}
