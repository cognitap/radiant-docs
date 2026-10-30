'use client'

import '@cognitap/radiant/styles.css'
import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, useMemo } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Input,
  Link,
  ThemeScope,
  type Theme
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { MotionProvider, useReducedMotion, useSpringLayout } from '@cognitap/radiant/motion/react'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const projects = [
  {
    id: 'inbox',
    name: 'Calmer inbox',
    team: 'PRODUCT / IN PROGRESS',
    description: 'A few thoughtful defaults. A little less noise.',
    note: 'Keep the daily digest optional.',
    progress: 72
  },
  {
    id: 'welcome',
    name: 'Warm welcome',
    team: 'DESIGN / READY TO EXPLORE',
    description: 'Make the first five minutes feel like a conversation.',
    note: 'Start with one useful question.',
    progress: 48
  },
  {
    id: 'launch',
    name: 'Launch notes',
    team: 'STUDIO / UP NEXT',
    description: 'Give the next good idea a clear story.',
    note: 'Lead with what people can do.',
    progress: 24
  }
]
type Project = (typeof projects)[number]
const stack = { display: 'grid', gap: '1rem', minWidth: 0 } as const

export function CardDashboardExample({
  staticMotion = false,
  theme = radiant
}: {
  staticMotion?: boolean
  theme?: Theme
}) {
  const [off, setOff] = useState(false)
  const selected = useMemo<Theme>(
    () => ({
      ...theme,
      motion: { ...theme.motion, mode: off || staticMotion ? 'off' : theme.motion.mode }
    }),
    [theme, off, staticMotion]
  )
  return (
    <ThemeScope
      theme={selected}
      style={{
        maxWidth: '68rem',
        minWidth: 0,
        padding: '.5rem',
        overflowX: 'clip',
        overflowClipMargin: '.5rem',
        '--rad-card-padding': 'clamp(.75rem, 3vw, 1.5rem)'
      }}
    >
      <MotionProvider>
        <ProjectBoard
          off={selected.motion.mode === 'off'}
          staticMotion={staticMotion}
          onOffChange={setOff}
        />
      </MotionProvider>
    </ThemeScope>
  )
}

function ProjectBoard({
  off,
  staticMotion,
  onOffChange
}: {
  off: boolean
  staticMotion: boolean
  onOffChange: (value: boolean) => void
}) {
  const root = useRef<HTMLOListElement>(null)
  useSpringLayout(root)
  const reduced = useReducedMotion()
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const [order, setOrder] = useState(projects.map(project => project.id))
  const [stacked, setStacked] = useState(false)
  return (
    <div style={stack}>
      <div>
        <CardDescription>STUDIO / THIS WEEK</CardDescription>
        <h2 style={{ margin: '.5rem 0', fontSize: '1.75rem', lineHeight: 1.2 }}>
          Small steps. Good momentum.
        </h2>
        <p style={{ margin: 0 }}>
          Keep the next move close. Give the details room when you need them.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Checkbox
          label="Stack cards"
          checked={stacked}
          onChange={event => setStacked(event.target.checked)}
        />
        <Checkbox
          label="Turn off spatial motion"
          checked={off}
          disabled={staticMotion}
          onChange={event => onOffChange(event.target.checked)}
        />
        <Button
          variant="ghost"
          tone="neutral"
          disabled={!ready}
          onClick={() => {
            setOrder(projects.map(project => project.id))
            setStacked(false)
          }}
        >
          Reset layout
        </Button>
      </div>
      <ol
        ref={root}
        aria-label="Studio projects"
        style={{
          display: 'grid',
          gridTemplateColumns: stacked
            ? 'minmax(0, 1fr)'
            : 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
          alignItems: 'start',
          gap: '1rem',
          padding: 0,
          margin: 0,
          listStyle: 'none',
          minWidth: 0
        }}
      >
        {order.map((id, index) => {
          const project = projects.find(project => project.id === id)!
          return (
            <li
              key={id}
              data-rad-layout-slot=""
              style={{ display: 'flow-root', minWidth: 0 }}
            >
              <div
                data-rad-layout-part=""
                style={{ minWidth: 0 }}
              >
                <ProjectCard
                  project={project}
                  index={index}
                  ready={ready}
                  onMove={() =>
                    setOrder(current => {
                      const position = current.indexOf(id)
                      const next = [...current]
                      if (position === current.length - 1)
                        return [id, ...current.filter(value => value !== id)]
                      next[position] = current[position + 1]
                      next[position + 1] = id
                      return next
                    })
                  }
                />
              </div>
            </li>
          )
        })}
      </ol>
      <output>
        Order: {order.join(', ')} ·{' '}
        {reduced ? 'Reduced by system' : off ? 'Motion off' : 'System motion'}
      </output>
    </div>
  )
}

function ProjectCard({
  project,
  index,
  ready,
  onMove
}: {
  project: Project
  index: number
  ready: boolean
  onMove: () => void
}) {
  const id = useId()
  const move = useRef<HTMLButtonElement>(null)
  const focusMove = useRef(false)
  const [expanded, setExpanded] = useState(false)
  const [count, setCount] = useState(1)
  const [feedback, setFeedback] = useState('Draft stays with this project.')
  const [outlined, setOutlined] = useState(false)
  useLayoutEffect(() => {
    if (focusMove.current) {
      move.current?.focus()
      focusMove.current = false
    }
  }, [index])
  return (
    <article
      aria-labelledby={`${id}-title`}
      data-project={project.id}
    >
      <Card
        style={{
          outline: outlined ? '2px dashed var(--rad-color-focus)' : undefined,
          outlineOffset: '2px'
        }}
      >
        <CardHeader>
          <CardDescription>{project.team}</CardDescription>
          <CardTitle
            id={`${id}-title`}
            level={3}
          >
            {project.name}
          </CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={stack}>
            <div>
              <CardDescription>{project.progress}% of the way there</CardDescription>
              <progress
                aria-label={`${project.name} progress`}
                value={project.progress}
                max={100}
                style={{ width: '100%', height: '.5rem', accentColor: 'var(--rad-color-accent)' }}
              />
            </div>
            <form
              aria-label={`${project.name} note`}
              style={stack}
              onSubmit={event => {
                event.preventDefault()
                const note = new FormData(event.currentTarget).get('note')
                setFeedback(`Saved locally: ${note || 'Empty note'}`)
              }}
              onReset={() => setFeedback('Draft reset. Project details are unchanged.')}
            >
              <Field label="Project note">
                <Input
                  name="note"
                  defaultValue={project.note}
                />
              </Field>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                <Button
                  type="submit"
                  controlSize="small"
                  disabled={!ready}
                >
                  Save note
                </Button>
                <Button
                  type="reset"
                  controlSize="small"
                  variant="ghost"
                  tone="neutral"
                >
                  Reset note
                </Button>
              </div>
              <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
            </form>
            <div
              id={`${id}-details`}
              hidden={!expanded}
            >
              <div style={stack}>
                <CardDescription>Leave a clear trail for the next person.</CardDescription>
                {Array.from({ length: count }, (_, position) => (
                  <p
                    key={position}
                    style={{ margin: 0 }}
                  >
                    Step {position + 1}. Try a small change, share what you learn, and keep the next
                    step visible.
                  </p>
                ))}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  <Button
                    variant="outline"
                    tone="neutral"
                    controlSize="small"
                    disabled={count === 4}
                    onClick={() => setCount(value => value + 1)}
                  >
                    Add step
                  </Button>
                  <Button
                    variant="ghost"
                    tone="neutral"
                    controlSize="small"
                    disabled={count === 1}
                    onClick={() => setCount(1)}
                  >
                    Trim steps
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            tone="neutral"
            controlSize="small"
            aria-expanded={expanded}
            aria-controls={`${id}-details`}
            disabled={!ready}
            onClick={() => setExpanded(value => !value)}
          >
            {expanded ? 'Hide details' : 'Show details'}
          </Button>
          <Button
            ref={move}
            variant="ghost"
            tone="neutral"
            controlSize="small"
            aria-label={`${index === projects.length - 1 ? 'Move first' : 'Move next'}: ${project.name}`}
            disabled={!ready}
            onClick={() => {
              focusMove.current = true
              onMove()
            }}
          >
            {index === projects.length - 1 ? 'Move first' : 'Move next'}
          </Button>
          <Link href="/docs/getting-started/">Open guide</Link>
        </CardFooter>
        <Checkbox
          label="Outline this card"
          checked={outlined}
          onChange={event => {
            setOutlined(event.target.checked)
          }}
        />
      </Card>
    </article>
  )
}
