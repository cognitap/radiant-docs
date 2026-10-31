'use client'
import { useId, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Link,
  type CardHeadingLevel,
  type CardProps
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './card-example.css'
export type CardTask = 'note' | 'actions' | 'link'
type Presentation = Pick<CardProps, 'style'> & { level?: CardHeadingLevel }
export function CardExample({ task = 'note', ...props }: Presentation & { task?: CardTask }) {
  return task === 'actions' ? (
    <TrackOrder {...props} />
  ) : task === 'link' ? (
    <OpenProject {...props} />
  ) : (
    <StudioNote {...props} />
  )
}
function StudioNote({ level, style }: Presentation) {
  return (
    <Card
      className="card-example"
      style={style}
    >
      <CardHeader>
        <CardTitle level={level}>Studio note</CardTitle>
        <CardDescription>Kiln schedule for this week.</CardDescription>
      </CardHeader>
      <CardContent>The glaze fires overnight. Unload the shelves after 9 a.m.</CardContent>
    </Card>
  )
}
function TrackOrder({ level, style }: Presentation) {
  const id = useId(),
    [status, setStatus] = useState('')
  return (
    <Card
      className="card-example"
      style={style}
    >
      <CardHeader>
        <CardTitle level={level}>Shipping</CardTitle>
        <CardDescription>Leaves the studio tomorrow.</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          id={`${id}-details`}
          tabIndex={-1}
          className="card-example-target"
        >
          Ships in two days. The blue set is packed.
        </p>
        <output>{status}</output>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setStatus('Tracking: the package is being prepared for dispatch.')}>
          Track
        </Button>
        <Link href={`#${id}-details`}>Details</Link>
      </CardFooter>
    </Card>
  )
}
function OpenProject({ level, style }: Presentation) {
  const id = useId()
  return (
    <div className="card-example-list">
      <Card
        className="card-example card-link"
        style={style}
      >
        <CardHeader>
          <CardTitle level={level}>
            <Link
              href={`#${id}-inbox`}
              variant="subtle"
              tone="neutral"
            >
              Calmer inbox
            </Link>
          </CardTitle>
          <CardDescription>A few thoughtful defaults. A little less noise.</CardDescription>
        </CardHeader>
        <CardContent>72% complete</CardContent>
      </Card>
      <p
        id={`${id}-inbox`}
        tabIndex={-1}
        className="card-example-target"
      >
        Project opened.
      </p>
    </div>
  )
}
