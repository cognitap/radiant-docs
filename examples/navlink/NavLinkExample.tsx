'use client'
import { useEffect, useId, useRef, useState } from 'react'
import {
  NavLink,
  NavLinkGroup,
  NavLinkGroupTrigger,
  NavLinkGroupContent,
  type NavLinkProps,
  type NavLinkRenderProps,
  type NavLinkGroupProps
} from '@cognitap/radiant'
export type NavLinkTaskOptions = Pick<
  NavLinkProps,
  'controlSize' | 'dir' | 'className' | 'style' | 'parts'
> & { icons?: boolean; descriptions?: boolean; motion?: NavLinkGroupProps['motion'] }
/** The example application owns routes, browser history and accepted-page focus. */
function useRoute<Key extends string>(keys: readonly Key[], initial: Key) {
  const prefix = useId(),
    nav = useRef<HTMLElement>(null),
    content = useRef<HTMLElement>(null),
    visited = useRef(false),
    [current, setCurrent] = useState(initial)
  const href = (key: Key) => `#${prefix}-${key}`
  useEffect(() => {
    const view = nav.current?.ownerDocument.defaultView
    if (!view) return
    const read = () => {
      const key = keys.find(key => view.location.hash === `#${prefix}-${key}`)
      if (key !== undefined) {
        visited.current = true
        setCurrent(key)
      } else if (!view.location.hash && visited.current) setCurrent(initial)
    }
    read()
    view.addEventListener('hashchange', read)
    view.addEventListener('popstate', read)
    return () => {
      view.removeEventListener('hashchange', read)
      view.removeEventListener('popstate', read)
    }
  }, [keys, prefix, initial])
  useEffect(() => {
    const node = content.current
    if (node && visited.current) node.focus()
  }, [current, prefix])
  const navigate = (target: string) => {
    const view = nav.current?.ownerDocument.defaultView
    if (!view) return
    const hash = new URL(target, view.location.href).hash,
      key = keys.find(key => hash === href(key))
    if (key === undefined) return
    visited.current = true
    view.history.pushState(null, '', target)
    setCurrent(key)
    if (key === current) content.current?.focus()
  }
  return { nav, content, current, href, navigate }
}
export function NavRouterAnchor({
  navigate,
  onClick,
  href,
  target,
  download,
  children,
  ...props
}: NavLinkRenderProps & { navigate: (href: string) => void }) {
  return (
    <a
      {...props}
      href={href}
      target={target}
      download={download}
      onClick={event => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (target && target !== '_self') ||
          (download !== undefined && download !== false) ||
          new URL(href, event.currentTarget.ownerDocument.baseURI).origin !==
            event.currentTarget.ownerDocument.location.origin
        )
          return
        event.preventDefault()
        navigate(href)
      }}
    >
      {children}
    </a>
  )
}
export function NavigationIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        rx="2"
      />
      <path d="M3 8h14M8 8v9" />
    </svg>
  )
}
const workspaceKeys = ['overview', 'participants', 'exports'] as const
const workspace = {
  overview: {
    label: 'Overview',
    description: 'Study health and upcoming sessions',
    title: 'Reader study overview',
    detail: 'Three participants are ready for the reading study.',
    rows: ['Next session: Monday', 'Research lead: Maya']
  },
  participants: {
    label: 'Participants',
    description: 'People enrolled in the study',
    title: 'Study participants',
    detail: 'Three enrolled participants.',
    rows: ['Maya — confirmed', 'Ivo — confirmed', 'Kai — pending']
  },
  exports: {
    label: 'Exports',
    description: 'Prepared research files',
    title: 'Study exports',
    detail: 'Two files are ready to review.',
    rows: ['Participant roster.csv', 'Session notes.md']
  }
}
const layout = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,14rem),1fr))',
  gap: '1.5rem',
  width: '100%',
  maxWidth: '40rem',
  minWidth: 0
} as const
const panel = {
  minWidth: 0,
  padding: '1rem',
  border: '1px solid var(--rad-color-border)',
  borderRadius: '.5rem'
}
export function BrowseStudyWorkspace({
  icons = true,
  descriptions = true,
  motion: _motion,
  ...options
}: NavLinkTaskOptions) {
  const { nav, content, current, href, navigate } = useRoute(workspaceKeys, 'overview'),
    record = workspace[current]
  return (
    <div
      style={layout}
      dir={options.dir}
    >
      <nav
        ref={nav}
        aria-label="Study workspace"
      >
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {workspaceKeys.map(key => (
            <li key={key}>
              <NavLink
                {...options}
                href={href(key)}
                render={props => (
                  <NavRouterAnchor
                    {...props}
                    navigate={navigate}
                  />
                )}
                active={current === key}
                icon={icons ? <NavigationIcon /> : undefined}
                description={descriptions ? workspace[key].description : undefined}
              >
                {workspace[key].label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <section
        ref={content}
        id={href(current).slice(1)}
        tabIndex={-1}
        aria-label="Workspace page"
        style={panel}
      >
        <h3>{record.title}</h3>
        <p>{record.detail}</p>
        <ul>
          {record.rows.map(row => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
const projectKeys = ['reader', 'component', 'release'] as const
const projects = {
  reader: {
    name: 'Reader study',
    description: 'Reading research',
    participants: 12,
    status: 'Recruiting'
  },
  component: {
    name: 'Component kit',
    description: 'Interface research',
    participants: 8,
    status: 'Analysis'
  },
  release: {
    name: 'Release review',
    description: 'Delivery review',
    participants: 4,
    status: 'Scheduled'
  }
}
export function BrowseProjectLibrary({
  icons = true,
  descriptions = true,
  motion = 'inherit',
  ...options
}: NavLinkTaskOptions) {
  const { nav, content, current, href, navigate } = useRoute(projectKeys, 'reader'),
    record = projects[current]
  return (
    <div
      style={layout}
      dir={options.dir}
    >
      <nav
        ref={nav}
        aria-label="Project library"
      >
        <NavLinkGroup
          defaultOpen
          motion={motion}
        >
          <NavLinkGroupTrigger
            {...options}
            icon={icons ? <NavigationIcon /> : undefined}
            description={descriptions ? 'Research and delivery projects' : undefined}
          >
            Projects
          </NavLinkGroupTrigger>
          <NavLinkGroupContent>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {projectKeys.map(key => (
                <li key={key}>
                  <NavLink
                    {...options}
                    href={href(key)}
                    render={props => (
                      <NavRouterAnchor
                        {...props}
                        navigate={navigate}
                      />
                    )}
                    active={current === key}
                    icon={icons ? <NavigationIcon /> : undefined}
                    description={descriptions ? projects[key].description : undefined}
                  >
                    {projects[key].name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </NavLinkGroupContent>
        </NavLinkGroup>
      </nav>
      <section
        ref={content}
        id={href(current).slice(1)}
        tabIndex={-1}
        aria-label="Project page"
        style={panel}
      >
        <h3>{record.name}</h3>
        <p>{record.participants} participants</p>
        <p>{record.status}</p>
      </section>
    </div>
  )
}
const settingsKeys = ['profile', 'access', 'tokens'] as const
const settings = {
  profile: {
    label: 'Team profile',
    description: 'Workspace identity',
    detail: 'Research team: twelve members.'
  },
  access: {
    label: 'Access rules',
    description: 'Member permissions',
    detail: 'Two administrators can invite new members.'
  },
  tokens: {
    label: 'API tokens',
    description: 'Integration credentials',
    detail: 'One active integration token; values are managed by the application.'
  }
}
export function NavigateTeamSettings({
  icons = true,
  descriptions = true,
  motion = 'inherit',
  ...options
}: NavLinkTaskOptions) {
  const { nav, content, current, href, navigate } = useRoute(settingsKeys, 'profile'),
    [open, setOpen] = useState(true),
    record = settings[current]
  const item = (key: (typeof settingsKeys)[number]) => (
    <NavLink
      {...options}
      href={href(key)}
      active={current === key}
      icon={icons ? <NavigationIcon /> : undefined}
      description={descriptions ? settings[key].description : undefined}
      render={props => (
        <NavRouterAnchor
          {...props}
          navigate={navigate}
        />
      )}
    >
      {settings[key].label}
    </NavLink>
  )
  return (
    <div
      style={layout}
      dir={options.dir}
    >
      <nav
        ref={nav}
        aria-label="Team settings"
      >
        {item('profile')}
        <NavLinkGroup
          open={open}
          onOpenChange={setOpen}
          motion={motion}
        >
          <NavLinkGroupTrigger
            {...options}
            icon={icons ? <NavigationIcon /> : undefined}
          >
            Security
          </NavLinkGroupTrigger>
          <NavLinkGroupContent>
            {item('access')}
            {item('tokens')}
          </NavLinkGroupContent>
        </NavLinkGroup>
      </nav>
      <section
        ref={content}
        id={href(current).slice(1)}
        tabIndex={-1}
        aria-label="Settings page"
        style={panel}
      >
        <h3>{record.label}</h3>
        <p>{record.detail}</p>
      </section>
    </div>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type NavLinkTask = 'workspace' | 'projects' | 'settings'
export function NavLinkExample({
  task = 'workspace',
  ...props
}: NavLinkTaskOptions & { task?: NavLinkTask }) {
  return (
    <MotionProvider>
      {task === 'projects' ? (
        <BrowseProjectLibrary {...props} />
      ) : task === 'settings' ? (
        <NavigateTeamSettings {...props} />
      ) : (
        <BrowseStudyWorkspace {...props} />
      )}
    </MotionProvider>
  )
}
