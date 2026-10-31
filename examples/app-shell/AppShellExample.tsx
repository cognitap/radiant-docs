'use client'
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellSkipLink,
  Sidebar,
  SidebarTrigger,
  SidebarLabel,
  SidebarContent,
  NavLink,
  Button,
  Checkbox,
  Field,
  Input,
  Textarea,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableCaption,
  useAppShell,
  type AppShellProps,
  type SidebarProps
} from '@cognitap/radiant'

export type AppShellTaskOptions = Pick<AppShellProps, 'dir' | 'motion' | 'className' | 'style'> & {
  narrow?: boolean
  sidebarClassName?: string
  sidebarStyle?: SidebarProps['style']
  sidebarParts?: SidebarProps['parts']
}
/** A complete application gets its own document and viewport rather than nesting main landmarks. */
export function AppShellPreview({
  children,
  narrow = false,
  title
}: {
  children: ReactNode
  narrow?: boolean
  title: string
}) {
  const frame = useRef<HTMLIFrameElement>(null),
    [target, setTarget] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const element = frame.current
    if (!element) return
    const parent = element.ownerDocument,
      view = parent.defaultView!,
      doc = element.contentDocument!
    doc.body.style.margin = '0'
    doc.title = title
    doc.documentElement.lang = parent.documentElement.lang || 'en'
    const copies: HTMLElement[] = [],
      waits: Promise<void>[] = []
    const base = doc.createElement('base')
    base.href = 'about:blank'
    doc.head.append(base)
    copies.push(base)
    for (const source of parent.querySelectorAll('style,link[rel="stylesheet"]')) {
      if (source instanceof view.HTMLLinkElement) {
        const link = doc.createElement('link')
        link.rel = 'stylesheet'
        link.href = source.href
        link.media = source.media
        waits.push(
          new Promise((resolve, reject) => {
            link.onload = () => resolve()
            link.onerror = () => reject(new Error('Application preview stylesheet failed to load.'))
          })
        )
        doc.head.append(link)
        copies.push(link)
      } else {
        const style = doc.createElement('style')
        style.textContent = (source.textContent ?? '').replace(
          /url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
          (whole, _quote, url: string) => {
            if (/^(data:|blob:|#)/.test(url)) return whole
            try {
              return `url(${JSON.stringify(new URL(url, parent.baseURI).href)})`
            } catch {
              return whole
            }
          }
        )
        doc.head.append(style)
        copies.push(style)
      }
    }
    const variables = new Set<string>()
    const sync = () => {
      const css = view.getComputedStyle(element)
      for (const name of variables) doc.documentElement.style.removeProperty(name)
      variables.clear()
      for (const name of Array.from(css))
        if (name.startsWith('--rad-') && css.getPropertyValue(name)) {
          variables.add(name)
          doc.documentElement.style.setProperty(name, css.getPropertyValue(name))
        }
      doc.documentElement.style.colorScheme = css.colorScheme
      doc.body.style.fontFamily = css.fontFamily
      doc.body.style.fontSize = css.fontSize
      doc.body.style.lineHeight = css.lineHeight
      doc.body.style.background = 'var(--rad-color-surface)'
      doc.body.style.color = 'var(--rad-color-foreground)'
    }
    sync()
    let stopped = false
    void Promise.all(waits).then(() => {
      if (!stopped) {
        sync()
        setTarget(doc.body)
      }
    })
    const changes = new view.MutationObserver(sync)
    for (let node: HTMLElement | null = element; node; node = node.parentElement)
      changes.observe(node, {
        attributes: true,
        attributeFilter: ['class', 'style', 'dir', 'data-rad-theme', 'data-rad-mode']
      })
    const mode = view.matchMedia('(prefers-color-scheme: dark)')
    mode.addEventListener('change', sync)
    return () => {
      stopped = true
      changes.disconnect()
      mode.removeEventListener('change', sync)
      copies.forEach(copy => copy.remove())
    }
  }, [title])
  return (
    <>
      <iframe
        ref={frame}
        title={title}
        style={{
          display: 'block',
          boxSizing: 'border-box',
          width: narrow ? 'min(20rem,100%)' : '100%',
          height: '34rem',
          border: '1px solid var(--rad-color-border)',
          borderRadius: '0.5rem'
        }}
      />
      {target && createPortal(children, target)}
    </>
  )
}
const projects = [
  {
    key: 'atlas',
    label: 'Atlas onboarding',
    summary: 'Find where new participants lose their place while setting up a profile.',
    participants: 12,
    completed: 8
  },
  {
    key: 'harbor',
    label: 'Harbor reading',
    summary: 'Compare recall after a short passage and record participants’ text preferences.',
    participants: 18,
    completed: 15
  },
  {
    key: 'orchard',
    label: 'Orchard navigation',
    summary:
      'Observe how returning participants find earlier sessions and recover from wrong turns.',
    participants: 9,
    completed: 5
  }
]
function ProjectIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M3 6h7l2 3h9v11H3z" />
      <path d="M3 6V4h7l2 3h9v2" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
function ProjectNavigation({
  selected,
  onNavigate
}: {
  selected: string
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, key: string) => void
}) {
  const shell = useAppShell()
  if (!shell) throw new Error('Project navigation requires AppShell.')
  return (
    <div style={{ display: 'grid', gap: '0.375rem' }}>
      {projects.map(project => (
        <NavLink
          key={project.key}
          href={`#${shell.mainId}`}
          active={selected === project.key}
          icon={<ProjectIcon />}
          onClick={event => onNavigate(event, project.key)}
        >
          <SidebarLabel>{project.label}</SidebarLabel>
        </NavLink>
      ))}
    </div>
  )
}
function ResearchApplication({
  task,
  ...options
}: AppShellTaskOptions & { task: 'sessions' | 'notes' | 'saved' }) {
  const [selected, setSelected] = useState('atlas'),
    [query, setQuery] = useState(''),
    [collapsed, setCollapsed] = useState(false),
    [open, setOpen] = useState(false),
    [keepExpanded, setKeepExpanded] = useState(false),
    [notes, setNotes] = useState('The participant checked the task title before continuing.'),
    [savedNotes, setSavedNotes] = useState(''),
    [feedback, setFeedback] = useState('Choose a project to review its research.'),
    [revision, setRevision] = useState(0),
    main = useRef<HTMLElement>(null),
    focusPending = useRef(false)
  const project = projects.find(project => project.key === selected)!
  const { narrow, sidebarClassName, sidebarStyle, sidebarParts, ...rootOptions } = options
  const label =
    task === 'notes'
      ? 'Research notebook'
      : task === 'saved'
        ? 'Saved research layout'
        : 'Research sessions'
  useEffect(() => {
    if (focusPending.current && !open) {
      focusPending.current = false
      main.current?.focus()
    }
  }, [revision, open])
  const navigate = (event: MouseEvent<HTMLAnchorElement>, key: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return
    event.preventDefault()
    setSelected(key)
    setOpen(false)
    setRevision(value => value + 1)
    focusPending.current = true
    setFeedback(`${projects.find(project => project.key === key)!.label} opened.`)
  }
  const collapse = (value: boolean) => {
    if (value && keepExpanded) {
      setFeedback('Keep full navigation is enabled.')
      return
    }
    setCollapsed(value)
  }
  return (
    <AppShellPreview
      narrow={narrow}
      title={`${label} application`}
    >
      <AppShell
        {...rootOptions}
        collapsed={collapsed}
        onCollapsedChange={collapse}
        open={open}
        onOpenChange={setOpen}
      >
        <AppShellSkipLink>Skip to research content</AppShellSkipLink>
        <AppShellHeader>
          <h1 style={{ fontSize: '1rem', margin: 0 }}>{label}</h1>
          <SidebarTrigger aria-label="Toggle project navigation">
            <MenuIcon />
          </SidebarTrigger>
        </AppShellHeader>
        <Sidebar
          label="Project navigation"
          className={sidebarClassName}
          style={sidebarStyle}
          parts={sidebarParts}
        >
          <SidebarContent expandedOnly>
            <Field label="Project note">
              <Input
                value={query}
                onChange={event => setQuery(event.currentTarget.value)}
                placeholder="Add a reminder"
              />
            </Field>
          </SidebarContent>
          <ProjectNavigation
            selected={selected}
            onNavigate={navigate}
          />
          <SidebarContent expandedOnly>
            <p style={{ fontSize: '0.8125rem', margin: 0 }}>
              Your reminder stays here when navigation collapses or moves into the mobile drawer.
            </p>
          </SidebarContent>
        </Sidebar>
        <AppShellMain
          ref={main}
          aria-label="Research content"
        >
          <h2 style={{ marginTop: 0 }}>{project.label}</h2>
          <p>{project.summary}</p>
          {task === 'sessions' && (
            <Table>
              <TableCaption>Current project sessions</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader>Participants</TableHeader>
                  <TableHeader>Completed</TableHeader>
                  <TableHeader>Remaining</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{project.participants}</TableCell>
                  <TableCell>{project.completed}</TableCell>
                  <TableCell>{project.participants - project.completed}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
          {task === 'notes' && (
            <form
              aria-label="Research note"
              onSubmit={event => {
                event.preventDefault()
                setSavedNotes(notes)
                setFeedback(`Note saved for ${project.label}.`)
              }}
            >
              <Field label="Interview notes">
                <Textarea
                  value={notes}
                  onChange={event => setNotes(event.currentTarget.value)}
                />
              </Field>
              <Button
                type="submit"
                style={{ marginTop: '1rem' }}
              >
                Save note
              </Button>
              {savedNotes && <blockquote aria-label="Saved note">{savedNotes}</blockquote>}
            </form>
          )}
          {task === 'saved' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Checkbox
                label="Keep full navigation"
                checked={keepExpanded}
                onChange={event => setKeepExpanded(event.currentTarget.checked)}
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button
                  onClick={event => {
                    try {
                      event.currentTarget.ownerDocument.defaultView!.localStorage.setItem(
                        'radiant-research-shell',
                        JSON.stringify({ collapsed, selected })
                      )
                      setFeedback('Research layout saved.')
                    } catch {
                      setFeedback('Layout could not be saved in this browser.')
                    }
                  }}
                >
                  Save layout
                </Button>
                <Button
                  variant="outline"
                  tone="neutral"
                  onClick={() => {
                    setCollapsed(false)
                    setOpen(false)
                    setKeepExpanded(false)
                    setSelected('atlas')
                    setFeedback('Default research layout restored.')
                  }}
                >
                  Reset layout
                </Button>
                <Button
                  variant="outline"
                  tone="neutral"
                  onClick={event => {
                    try {
                      const text =
                          event.currentTarget.ownerDocument.defaultView!.localStorage.getItem(
                            'radiant-research-shell'
                          ),
                        value: unknown = text ? JSON.parse(text) : null
                      if (
                        !value ||
                        typeof value !== 'object' ||
                        !('collapsed' in value) ||
                        typeof value.collapsed !== 'boolean' ||
                        !('selected' in value) ||
                        typeof value.selected !== 'string' ||
                        !projects.some(project => project.key === value.selected)
                      )
                        throw new Error('Invalid layout')
                      setCollapsed(value.collapsed)
                      setSelected(value.selected)
                      setOpen(false)
                      setFeedback('Saved research layout restored.')
                    } catch {
                      setFeedback('No valid saved research layout is available.')
                    }
                  }}
                >
                  Restore saved layout
                </Button>
              </div>
            </div>
          )}
          <output
            aria-label="Research workspace feedback"
            aria-live="polite"
            style={{ display: 'block', marginTop: '1rem' }}
          >
            {feedback}
          </output>
        </AppShellMain>
      </AppShell>
    </AppShellPreview>
  )
}
export function ReviewResearchSessions(options: AppShellTaskOptions) {
  return (
    <ResearchApplication
      {...options}
      task="sessions"
    />
  )
}
export function WriteResearchNotes(options: AppShellTaskOptions) {
  return (
    <ResearchApplication
      {...options}
      task="notes"
    />
  )
}
export function RestoreResearchLayout(options: AppShellTaskOptions) {
  return (
    <ResearchApplication
      {...options}
      task="saved"
    />
  )
}
