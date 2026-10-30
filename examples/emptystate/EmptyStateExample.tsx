'use client'
import { useEffect, useRef, useState, type ComponentProps } from 'react'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  Button,
  Field,
  Combobox,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPortal,
  ComboboxContent,
  Command,
  CommandTrigger,
  CommandContent,
  CommandTitle,
  CommandDescription,
  CommandInput,
  CommandList,
  CommandClose,
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableContainer,
  type EmptyStateProps,
  type EmptyStateHeadingLevel
} from '@cognitap/radiant'
export type EmptyStateTaskOptions = Pick<EmptyStateProps, 'tone' | 'className' | 'style'> & {
  dir?: 'ltr' | 'rtl'
  level?: EmptyStateHeadingLevel
}
const appStyle = {
  display: 'grid',
  gap: '1rem',
  width: '100%',
  maxWidth: '36rem',
  minWidth: 0
} as const
function SearchMark(props: ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle
        cx="13"
        cy="13"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m19 19 8 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
export function EmptyMessage({
  variant = 'first-use',
  level = 3,
  ...options
}: EmptyStateTaskOptions & Pick<EmptyStateProps, 'variant'>) {
  const text =
    variant === 'error'
      ? ['Reports unavailable', 'Reconnect the catalog to continue searching.']
      : variant === 'no-results'
        ? ['No matching projects', 'Try a different name or clear your search.']
        : ['No projects yet', 'Create a study project to organize participants and reports.']
  return (
    <EmptyState
      {...options}
      variant={variant}
    >
      <EmptyStateIcon>
        <SearchMark />
      </EmptyStateIcon>
      <EmptyStateTitle level={level}>{text[0]}</EmptyStateTitle>
      <EmptyStateDescription>{text[1]}</EmptyStateDescription>
    </EmptyState>
  )
}
export function CreateStudyProject({ level = 3, ...options }: EmptyStateTaskOptions) {
  const [created, setCreated] = useState(false),
    [opened, setOpened] = useState(false),
    [message, setMessage] = useState('No study projects.')
  const open = useRef<HTMLButtonElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    focus = useRef<'row' | 'details' | null>(null)
  useEffect(() => {
    if (focus.current === 'row') open.current?.focus()
    if (focus.current === 'details') heading.current?.focus()
    focus.current = null
  }, [created, opened])
  return (
    <section
      aria-label="Project table"
      dir={options.dir}
      style={appStyle}
    >
      <TableContainer aria-label="Study projects">
        <Table>
          <TableCaption>Study projects</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeader scope="col">Name</TableHeader>
              <TableHeader scope="col">Status</TableHeader>
              <TableHeader scope="col">Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {created ? (
              <TableRow>
                <TableCell>Reader study</TableCell>
                <TableCell>Draft</TableCell>
                <TableCell>
                  <Button
                    ref={open}
                    variant="outline"
                    tone="neutral"
                    onClick={() => {
                      if (opened) heading.current?.focus()
                      else {
                        focus.current = 'details'
                        setOpened(true)
                      }
                      setMessage('Reader study opened.')
                    }}
                  >
                    Open Reader study
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={3}>
                  <EmptyState
                    {...options}
                    variant="first-use"
                  >
                    <EmptyStateIcon>
                      <SearchMark />
                    </EmptyStateIcon>
                    <EmptyStateTitle level={level}>No projects yet</EmptyStateTitle>
                    <EmptyStateDescription>
                      Create a study project to organize participants and reports.
                    </EmptyStateDescription>
                    <EmptyStateActions>
                      <Button
                        onClick={() => {
                          setCreated(true)
                          focus.current = 'row'
                          setMessage('Reader study created.')
                        }}
                      >
                        Create study project
                      </Button>
                    </EmptyStateActions>
                  </EmptyState>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {opened ? (
        <section aria-label="Project details">
          <h3
            ref={heading}
            tabIndex={-1}
          >
            Reader study
          </h3>
          <p>Draft project · 0 participants · Ready for your first session.</p>
        </section>
      ) : null}
      <output aria-live="polite">{message}</output>
    </section>
  )
}
const projects = [
  { value: 'reader', label: 'Reader study' },
  { value: 'retention', label: 'Retention study' }
]
export function FindStudyProject({ level = 3, ...options }: EmptyStateTaskOptions) {
  const [value, setValue] = useState<string | null>(null),
    [query, setQuery] = useState(''),
    [open, setOpen] = useState(false),
    [project, setProject] = useState<string | null>(null),
    input = useRef<HTMLInputElement>(null)
  return (
    <form
      aria-label="Project finder"
      dir={options.dir}
      style={appStyle}
      onSubmit={e => {
        e.preventDefault()
        if (value) setProject(value)
      }}
      onReset={() => {
        setValue(null)
        setQuery('')
        setOpen(false)
        setProject(null)
      }}
    >
      <Field
        label="Project"
        required
        description="Search for a study project, then open the selected result."
      >
        <Combobox
          items={projects}
          name="project"
          required
          value={value}
          onValueChange={setValue}
          query={query}
          onQueryChange={setQuery}
          open={open}
          onOpenChange={setOpen}
          emptyText={
            <EmptyMessage
              {...options}
              level={level}
              variant="no-results"
            />
          }
        >
          <div className="relative w-full min-w-0">
            <ComboboxInput
              ref={input}
              placeholder="Search projects…"
            />
            <ComboboxTrigger className="absolute inset-y-0 end-0 w-12" />
          </div>
          <ComboboxPortal>
            <ComboboxContent />
          </ComboboxPortal>
        </Combobox>
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => {
            setQuery('')
            setOpen(true)
            input.current?.focus()
          }}
        >
          Clear search
        </Button>
        <Button type="submit">Open project</Button>
        <Button
          type="reset"
          variant="ghost"
          tone="neutral"
        >
          Reset finder
        </Button>
      </div>
      {project ? (
        <section aria-label="Selected project">
          <h3>{projects.find(item => item.value === project)!.label}</h3>
          <p>Project selected for the next research session.</p>
        </section>
      ) : (
        <p>No project is open.</p>
      )}
    </form>
  )
}
const reports = [
  { value: 'reader', label: 'Reader study report' },
  { value: 'completion', label: 'Session completion report' }
]
export function RecoverStudyReports({ level = 3, ...options }: EmptyStateTaskOptions) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(''),
    [connected, setConnected] = useState(false),
    [attempt, setAttempt] = useState(0),
    [result, setResult] = useState<{ attempt: number; items: typeof reports }>({
      attempt: 0,
      items: []
    }),
    [report, setReport] = useState<string | null>(null),
    input = useRef<HTMLInputElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    focusReport = useRef(false)
  useEffect(() => {
    if (!connected) return
    let current = true
    const timer = setTimeout(() => {
      if (current) setResult({ attempt, items: reports })
    }, 350)
    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [connected, attempt])
  useEffect(() => {
    if (!open && focusReport.current) {
      focusReport.current = false
      heading.current?.focus()
    }
  }, [open, report])
  const retry = () => {
    setAttempt(value => value + 1)
    setConnected(true)
    input.current?.focus()
  }
  return (
    <section
      aria-label="Report recovery"
      dir={options.dir}
      style={appStyle}
    >
      <Command
        items={result.items}
        query={query}
        onQueryChange={setQuery}
        open={open}
        onOpenChange={setOpen}
        loading={connected && result.attempt !== attempt}
        onAction={value => {
          focusReport.current = true
          setReport(value)
        }}
        errorText={
          !connected ? (
            <EmptyState
              {...options}
              variant="error"
              tone={options.tone ?? 'danger'}
            >
              <EmptyStateIcon>
                <SearchMark />
              </EmptyStateIcon>
              <EmptyStateTitle level={level}>Reports unavailable</EmptyStateTitle>
              <EmptyStateDescription>
                Reconnect the catalog to continue searching.
              </EmptyStateDescription>
              <EmptyStateActions>
                <Button onClick={retry}>Retry report search</Button>
              </EmptyStateActions>
            </EmptyState>
          ) : undefined
        }
      >
        <CommandTrigger>Find a study report</CommandTrigger>
        <CommandContent dir={options.dir}>
          <CommandTitle>Study reports</CommandTitle>
          <CommandDescription>Search reports and explicitly open a result.</CommandDescription>
          <CommandInput
            ref={input}
            placeholder="Search reports…"
          />
          <CommandList
            className={!connected ? 'max-h-none shrink-0 overflow-visible' : undefined}
          />
          {connected ? (
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => {
                setConnected(false)
                input.current?.focus()
              }}
            >
              Disconnect catalog
            </Button>
          ) : null}
          <CommandClose
            variant="ghost"
            tone="neutral"
          >
            Close reports
          </CommandClose>
        </CommandContent>
      </Command>
      {report ? (
        <section aria-label="Report details">
          <h3
            ref={heading}
            tabIndex={-1}
          >
            {reports.find(item => item.value === report)!.label}
          </h3>
          <p>Completed sessions: {report === 'reader' ? 24 : 32}.</p>
        </section>
      ) : (
        <p>No report is open.</p>
      )}
    </section>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type EmptyStateTask = 'table' | 'search' | 'recovery'
export function EmptyStateExample({
  task = 'table',
  ...options
}: EmptyStateTaskOptions & { task?: EmptyStateTask }) {
  return (
    <MotionProvider>
      {task === 'search' ? (
        <FindStudyProject {...options} />
      ) : task === 'recovery' ? (
        <RecoverStudyReports {...options} />
      ) : (
        <CreateStudyProject {...options} />
      )}
    </MotionProvider>
  )
}
