'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Link,
  ThemeScope
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import type { CompositionOptions } from './composition-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './composition-example.css'

export function CardExample({
  theme = radiant,
  mode = 'light',
  compact = false
}: CompositionOptions) {
  const [bookmarked, setBookmarked] = useState(false)
  const ready = useHydrated()
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="composition-example"
    >
      <div className="composition-stack">
        <Card style={compact ? { '--rad-card-padding': '1rem' } : undefined}>
          <CardHeader>
            <CardTitle level={3}>Radiant starter</CardTitle>
            <CardDescription>A starting point for a native, themed interface.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="composition-copy">
              Install the package, load its stylesheet and build with the published components.
              Bookmark this guide to keep it handy in this preview.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              aria-pressed={bookmarked}
              disabled={!ready}
              onClick={() => setBookmarked(value => !value)}
            >
              {bookmarked ? 'Remove bookmark' : 'Bookmark'}
            </Button>
            <Link href="/docs/getting-started/">Installation guide</Link>
          </CardFooter>
        </Card>
        <output className="composition-result">
          {bookmarked ? 'Bookmarked locally.' : 'Not bookmarked.'}
        </output>
      </div>
    </ThemeScope>
  )
}
