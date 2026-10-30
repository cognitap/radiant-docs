'use client'
import { useId, useRef, useState } from 'react'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardPortal,
  Avatar,
  Badge,
  Link,
  Button,
  Checkbox,
  type HoverCardProps,
  type HoverCardContentProps,
  type HoverCardRenderProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
type Options = Pick<HoverCardProps, 'openDelay' | 'closeDelay' | 'defaultOpen'> &
  Pick<
    HoverCardContentProps,
    'side' | 'align' | 'sideOffset' | 'collisionPadding' | 'motion' | 'className' | 'style'
  > & { dir?: 'ltr' | 'rtl' }
const layout = {
  display: 'grid',
  gap: '1rem',
  width: 'min(30rem,calc(100vw - 2rem))',
  maxWidth: '100%'
}

import '@cognitap/radiant/styles.css'
export type HoverCardTask = 'contributor' | 'project' | 'resource' | 'related'
export function HoverCardExample({
  task = 'contributor',
  ...options
}: Options & { task?: HoverCardTask }) {
  return (
    <MotionProvider>
      {task === 'project' ? (
        <Project {...options} />
      ) : task === 'resource' ? (
        <Resource {...options} />
      ) : task === 'related' ? (
        <Related {...options} />
      ) : (
        <Contributor {...options} />
      )}
    </MotionProvider>
  )
}
function Contributor({ openDelay, closeDelay, defaultOpen, dir, ...surface }: Options) {
  const id = useId()
  return (
    <article
      style={layout}
      dir={dir}
    >
      <p>
        Reviewed by{' '}
        <HoverCard
          defaultOpen={defaultOpen}
          openDelay={openDelay}
          closeDelay={closeDelay}
        >
          <HoverCardTrigger href={`#${id}-profile`}>Lee Chen</HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent {...surface}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <Avatar
                  alt=""
                  fallback="LC"
                />
                <h3 style={{ margin: 0 }}>Lee Chen</h3>
              </div>
              <p style={{ margin: 0 }}>
                Design systems engineer helping teams build calmer interfaces.
              </p>
              <Link href={`#${id}-profile`}>Read full profile</Link>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
        .
      </p>
      <section
        id={`${id}-profile`}
        tabIndex={-1}
      >
        <h3>Contributor profile</h3>
        <p>
          Lee maintains interaction patterns, reviews keyboard flows and writes practical guides for
          the design team.
        </p>
      </section>
    </article>
  )
}
function Project({ openDelay, closeDelay, defaultOpen, dir, ...surface }: Options) {
  const id = useId(),
    [open, setOpen] = useState(defaultOpen ?? false),
    [pinned, setPinned] = useState(false)
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Checkbox
        label="Keep project preview open"
        checked={pinned}
        onChange={event => {
          setPinned(event.target.checked)
          setOpen(event.target.checked)
        }}
      />
      <p>
        Next milestone:{' '}
        <HoverCard
          open={open}
          onOpenChange={next => {
            if (!pinned) setOpen(next)
          }}
          openDelay={openDelay}
          closeDelay={closeDelay}
        >
          <HoverCardTrigger href={`#${id}-project`}>Website refresh</HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent {...surface}>
              <h3 style={{ margin: 0 }}>Website refresh</h3>
              <Badge
                tone="accent"
                className="w-fit"
              >
                In progress
              </Badge>
              <p style={{ margin: 0 }}>
                Navigation and search are ready. Content review is the remaining milestone.
              </p>
              <Link href={`#${id}-project`}>Open project details</Link>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      </p>
      <section
        id={`${id}-project`}
        tabIndex={-1}
      >
        <h3>Project details</h3>
        <p>Owner: Product team. Next review: Friday.</p>
      </section>
    </div>
  )
}
function RouterAnchor(props: HoverCardRenderProps) {
  return <a {...props}>{props.children}</a>
}
function Resource({ openDelay, closeDelay, defaultOpen, dir, ...surface }: Options) {
  const ref = useRef<HTMLAnchorElement>(null),
    [message, setMessage] = useState('No navigation requested.'),
    [confirm, setConfirm] = useState(true)
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Checkbox
        label="Confirm external navigation"
        checked={confirm}
        onChange={event => setConfirm(event.target.checked)}
      />
      <Button
        variant="ghost"
        onClick={() => ref.current?.focus()}
      >
        Focus resource link
      </Button>
      <output aria-live="polite">{message}</output>
      <p>
        Reference:{' '}
        <HoverCard
          defaultOpen={defaultOpen}
          openDelay={openDelay}
          closeDelay={closeDelay}
        >
          <HoverCardTrigger
            href="https://www.w3.org/WAI/"
            external
            ref={ref}
            render={props => <RouterAnchor {...props} />}
            onClick={event => {
              if (confirm) {
                event.preventDefault()
                setMessage('External resource is ready. Disable confirmation to open it.')
              } else setMessage('Opening accessibility resources.')
            }}
          >
            Accessibility resources
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent {...surface}>
              <h3 style={{ margin: 0 }}>Web Accessibility Initiative</h3>
              <p style={{ margin: 0 }}>Guides and standards for building accessible experiences.</p>
              <p style={{ margin: 0 }}>Opens w3.org in a new tab.</p>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      </p>
    </div>
  )
}
function Related({ openDelay, closeDelay, defaultOpen, dir, ...surface }: Options) {
  const id = useId()
  return (
    <div
      style={layout}
      dir={dir}
    >
      <h3>Continue reading</h3>
      <ul>
        <li>
          <HoverCard
            defaultOpen={defaultOpen}
            openDelay={openDelay}
            closeDelay={closeDelay}
          >
            <HoverCardTrigger href={`#${id}-focus`}>Designing focus flows</HoverCardTrigger>
            <HoverCardPortal>
              <HoverCardContent
                {...surface}
                style={{ '--rad-hover-card-width': '18rem', ...surface.style }}
              >
                <h3 style={{ margin: 0 }}>Designing focus flows</h3>
                <p style={{ margin: 0 }}>
                  A short guide to predictable keyboard paths across related actions.
                </p>
                <Link href={`#${id}-focus`}>Read the guide</Link>
              </HoverCardContent>
            </HoverCardPortal>
          </HoverCard>
        </li>
        <li>
          <Link href={`#${id}-forms`}>Grouping forms</Link>
        </li>
      </ul>
      <section
        id={`${id}-focus`}
        tabIndex={-1}
      >
        <h3>Designing focus flows</h3>
        <p>Start with native controls, group related actions and keep focus visible.</p>
      </section>
      <section
        id={`${id}-forms`}
        tabIndex={-1}
      >
        <h3>Grouping forms</h3>
        <p>Give related fields a clear shared name.</p>
      </section>
    </div>
  )
}
