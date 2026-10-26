'use client'

import { useRef, useState } from 'react'
import NextLink from 'next/link'
import { Button, Link, ThemeScope, radiant, type Theme, type ThemeMode } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './link-example.css'
import { useHydrated } from '../profile/useHydrated'

const destination = '/docs/foundations/'

export function RouterLinkExample({
  newTab = false,
  theme = radiant,
  mode = 'light'
}: {
  newTab?: boolean
  theme?: Theme
  mode?: ThemeMode
}) {
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const ready = useHydrated()
  const [feedback, setFeedback] = useState('Focus the link, then use Enter to navigate.')

  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="link-example"
    >
      <Link
        ref={anchorRef}
        href={destination}
        variant="outline"
        external={newTab}
        onFocus={() => setFeedback('The ref reached the native anchor.')}
        render={props => (
          <NextLink
            {...props}
            href={props.href ?? destination}
          />
        )}
      >
        Explore system foundations{newTab ? ' (opens in a new tab)' : ''}
      </Link>
      <Button
        variant="ghost"
        disabled={!ready}
        onClick={() => anchorRef.current?.focus()}
      >
        Focus router link
      </Button>
      <output>{feedback}</output>
    </ThemeScope>
  )
}
