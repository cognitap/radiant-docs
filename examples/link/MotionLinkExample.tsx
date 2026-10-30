'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Link,
  type ButtonProps
} from '@cognitap/radiant'
import { MotionProvider, MotionLink } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
import './link-example.css'
import { useHydrated } from '../profile/useHydrated'

export function MotionLinkExample({
  variant = 'solid',
  tone = 'accent',
  controlSize = 'large',
  motion = 'inherit'
}: Pick<ButtonProps, 'variant' | 'tone' | 'controlSize' | 'motion'> & {}) {
  const [saved, setSaved] = useState(false)
  const ready = useHydrated()
  return (
    <div className="link-motion-example">
      <MotionProvider>
        <Card>
          <CardHeader>
            <CardDescription>YOUR NEXT CHAPTER</CardDescription>
            <CardTitle>A destination worth exploring.</CardTitle>
            <CardDescription>Navigate with a link. Save something with a button.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Start with a small idea and{' '}
              <Link href="/docs/getting-started/">read the installation guide</Link>.
            </p>
            <div className="link-motion-actions">
              <MotionLink
                href="/docs/foundations/"
                variant={variant}
                tone={tone}
                controlSize={controlSize}
                motion={motion}
              >
                Explore the foundations
              </MotionLink>
              <Button
                variant={variant}
                tone={tone}
                controlSize={controlSize}
                motion={motion}
                disabled={!ready}
                aria-pressed={saved}
                onClick={() => setSaved(value => !value)}
              >
                Save for later
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <output aria-live="polite">
              {saved ? 'Added to your reading list.' : 'Your reading list is clear.'}
            </output>
          </CardFooter>
        </Card>
      </MotionProvider>
    </div>
  )
}
