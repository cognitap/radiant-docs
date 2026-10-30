'use client'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  Command,
  CommandTrigger,
  CommandContent,
  CommandTitle,
  CommandDescription,
  CommandInput,
  CommandList,
  CommandClose,
  Button,
  Kbd,
  KbdGroup,
  type CommandContentProps,
  type CommandProps,
  type CommandOption
} from '@cognitap/radiant'
export type CommandTaskOptions = Pick<CommandContentProps, 'className' | 'style' | 'motion'> &
  Pick<CommandProps, 'controlSize' | 'closeOnEscape' | 'closeOnBackdrop' | 'modal'> & {
    dir?: 'ltr' | 'rtl'
    applicationLabel?: string
    initialOpen?: boolean
    disabled?: boolean
  }
export const projectActions: CommandOption[] = [
  { value: 'create', label: 'Create study project', group: 'Projects', shortcut: ['Ctrl/⌘', 'N'] },
  { value: 'duplicate', label: 'Duplicate current project', group: 'Projects' },
  { value: 'archive', label: 'Archive current project', group: 'Projects' },
  { value: 'publish', label: 'Publish project', group: 'Sharing', disabled: true }
]
function Shortcut({
  onOpen,
  onNew,
  applicationLabel,
  children,
  dir
}: {
  onOpen: () => void
  applicationLabel: string
  onNew?: () => void
  children: ReactNode
  dir?: 'ltr' | 'rtl'
}) {
  const shortcut = (event: KeyboardEvent) => {
    if (
      !event.defaultPrevented &&
      !event.nativeEvent.isComposing &&
      !event.repeat &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey &&
      (event.key.toLowerCase() === 'k' || (event.key.toLowerCase() === 'n' && onNew))
    ) {
      // This application explicitly accepts the shortcut from its own controls, including search.
      event.preventDefault()
      event.stopPropagation()
      if (event.key.toLowerCase() === 'n') onNew?.()
      else onOpen()
    }
  }
  return (
    <section
      aria-label={applicationLabel}
      dir={dir}
      onKeyDownCapture={shortcut}
      style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '32rem', minWidth: 0 }}
    >
      {children}
    </section>
  )
}
export function CommandSurface({
  title,
  description,
  ...options
}: CommandTaskOptions & { title: string; description: string }) {
  return (
    <CommandContent
      dir={options.dir}
      className={options.className}
      style={options.style}
      motion={options.motion}
    >
      <CommandTitle>{title}</CommandTitle>
      <CommandDescription>{description}</CommandDescription>
      <CommandInput placeholder="Search commands…" />
      <CommandList />
      <CommandClose
        variant="ghost"
        tone="neutral"
      >
        Close commands
      </CommandClose>
    </CommandContent>
  )
}
function PaletteTrigger({
  children,
  disabled,
  controlSize
}: {
  children: ReactNode
  disabled?: boolean
  controlSize?: CommandProps['controlSize']
}) {
  return (
    <CommandTrigger
      disabled={disabled}
      controlSize={controlSize}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {children}
        <KbdGroup aria-hidden="true">
          <Kbd>Ctrl/⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </span>
    </CommandTrigger>
  )
}
export function ManageStudyProjects({ initialOpen = false, ...options }: CommandTaskOptions) {
  const [open, setOpen] = useState(initialOpen),
    [projects, setProjects] = useState([{ id: 1, name: 'Reader study', archived: false }]),
    [current, setCurrent] = useState(1),
    [message, setMessage] = useState('Reader study is active.')
  const active = projects.find(project => project.id === current)!
  const items = projectActions.map(item => ({
    ...item,
    disabled: item.disabled || (item.value === 'archive' && active.archived)
  }))
  const action = (value: string) => {
    if (value === 'create' || value === 'duplicate') {
      const id = Math.max(...projects.map(project => project.id)) + 1
      const name = value === 'create' ? 'Study project ' + id : active.name + ' copy'
      setProjects(previous => [...previous, { id, name, archived: false }])
      setCurrent(id)
      setMessage(name + ' created.')
    } else if (value === 'archive') {
      setProjects(previous =>
        previous.map(project => (project.id === current ? { ...project, archived: true } : project))
      )
      setMessage(active.name + ' archived.')
    }
  }
  return (
    <Shortcut
      applicationLabel={options.applicationLabel ?? 'Project command application'}
      dir={options.dir}
      onNew={() => {
        if (!options.disabled) {
          action('create')
          setOpen(false)
        }
      }}
      onOpen={() => {
        if (!options.disabled) setOpen(true)
      }}
    >
      <p>Focus this application, then press Ctrl or ⌘ with K to find an action.</p>
      <Command
        items={items}
        open={open}
        onOpenChange={setOpen}
        onAction={action}
        controlSize={options.controlSize}
        modal={options.modal}
        closeOnEscape={options.closeOnEscape}
        closeOnBackdrop={options.closeOnBackdrop}
      >
        <PaletteTrigger
          disabled={options.disabled}
          controlSize={options.controlSize}
        >
          Project commands
        </PaletteTrigger>
        <CommandSurface
          {...options}
          title="Project commands"
          description="Create, duplicate or archive a local study project."
        />
      </Command>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.name}
            {project.archived ? ' — archived' : project.id === current ? ' — active' : ''}
          </li>
        ))}
      </ul>
      <output aria-live="polite">{message}</output>
    </Shortcut>
  )
}
const pages: CommandOption[] = [
  { value: 'overview', label: 'Open project overview', group: 'Navigate' },
  { value: 'settings', label: 'Open workspace settings', group: 'Navigate' },
  { value: 'billing', label: 'Open billing details', group: 'Navigate', disabled: true }
]
export function NavigateWorkspace({ initialOpen = false, ...options }: CommandTaskOptions) {
  const [open, setOpen] = useState(initialOpen),
    [page, setPage] = useState('overview'),
    heading = useRef<HTMLHeadingElement>(null),
    pendingFocus = useRef(false)
  useEffect(() => {
    if (!open && pendingFocus.current) {
      pendingFocus.current = false
      heading.current?.focus()
    }
  }, [open, page])
  return (
    <Shortcut
      applicationLabel={options.applicationLabel ?? 'Workspace navigation application'}
      dir={options.dir}
      onOpen={() => {
        if (!options.disabled) setOpen(true)
      }}
    >
      <Command
        items={pages}
        open={open}
        onOpenChange={setOpen}
        onAction={value => {
          setPage(value)
          pendingFocus.current = true
        }}
        controlSize={options.controlSize}
        modal={options.modal}
        closeOnEscape={options.closeOnEscape}
        closeOnBackdrop={options.closeOnBackdrop}
      >
        <PaletteTrigger
          disabled={options.disabled}
          controlSize={options.controlSize}
        >
          Navigate workspace
        </PaletteTrigger>
        <CommandSurface
          {...options}
          title="Navigate workspace"
          description="Open a workspace page. Billing requires an administrator."
        />
      </Command>
      <section aria-label="Workspace page">
        <h3
          ref={heading}
          tabIndex={-1}
        >
          {page === 'settings' ? 'Workspace settings' : 'Project overview'}
        </h3>
        {page === 'settings' ? (
          <>
            <p>Research workspace · 3 members</p>
            <Button
              onClick={() => {
                setPage('overview')
                heading.current?.focus()
              }}
            >
              Back to overview
            </Button>
          </>
        ) : (
          <>
            <p>Reader study · 24 participants</p>
            <p>Next milestone: review reading sessions.</p>
          </>
        )}
      </section>
    </Shortcut>
  )
}
const reports: CommandOption[] = [
  { value: 'reader', label: 'Open reader study report', group: 'Reports' },
  { value: 'retention', label: 'Open retention report', group: 'Reports' },
  { value: 'completion', label: 'Open completion report', group: 'Reports' }
]
export function FindStudyReport({ initialOpen = false, ...options }: CommandTaskOptions) {
  const [open, setOpen] = useState(initialOpen),
    [query, setQuery] = useState(''),
    [online, setOnline] = useState(true),
    [result, setResult] = useState<{ query: string | null; items: CommandOption[] }>({
      query: null,
      items: []
    }),
    [report, setReport] = useState<string | null>(null)
  useEffect(() => {
    if (!online) return
    let current = true
    const timer = setTimeout(() => {
      if (current)
        setResult({
          query,
          items: reports.filter(item =>
            item.label?.toString().toLowerCase().includes(query.toLowerCase())
          )
        })
    }, 350)
    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [query, online])
  return (
    <Shortcut
      applicationLabel={options.applicationLabel ?? 'Report search application'}
      dir={options.dir}
      onOpen={() => {
        if (!options.disabled) setOpen(true)
      }}
    >
      <Command
        items={result.items}
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
        filter={null}
        loading={online && result.query !== query}
        errorText={online ? undefined : 'Report search is disconnected.'}
        emptyText="No matching reports."
        onAction={setReport}
        controlSize={options.controlSize}
        modal={options.modal}
        closeOnEscape={options.closeOnEscape}
        closeOnBackdrop={options.closeOnBackdrop}
      >
        <PaletteTrigger
          disabled={options.disabled}
          controlSize={options.controlSize}
        >
          Find study report
        </PaletteTrigger>
        <CommandContent
          dir={options.dir}
          className={options.className}
          style={options.style}
          motion={options.motion}
        >
          <CommandTitle>Find study report</CommandTitle>
          <CommandDescription>
            Search the local report catalog, then explicitly open a result.
          </CommandDescription>
          <CommandInput placeholder="Search reports…" />
          <CommandList />
          <Button
            variant="outline"
            tone="neutral"
            onClick={() => setOnline(value => !value)}
          >
            {online ? 'Disconnect search' : 'Reconnect search'}
          </Button>
          <CommandClose
            variant="ghost"
            tone="neutral"
          >
            Close commands
          </CommandClose>
        </CommandContent>
      </Command>
      {report ? (
        <section aria-label="Selected report">
          <h3>{reports.find(item => item.value === report)!.label}</h3>
          <p>Completed sessions: {report === 'reader' ? 24 : report === 'retention' ? 18 : 32}.</p>
        </section>
      ) : (
        <p>No report is open. Search results do not open themselves.</p>
      )}
    </Shortcut>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type CommandTask = 'projects' | 'navigation' | 'lookup'
export function CommandExample({
  task = 'projects',
  ...options
}: CommandTaskOptions & { task?: CommandTask }) {
  return (
    <MotionProvider>
      {task === 'navigation' ? (
        <NavigateWorkspace {...options} />
      ) : task === 'lookup' ? (
        <FindStudyReport {...options} />
      ) : (
        <ManageStudyProjects {...options} />
      )}
    </MotionProvider>
  )
}
