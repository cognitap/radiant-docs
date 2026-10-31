'use client'
import { useState } from 'react'
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockViewport,
  CodeBlockContent,
  CodeBlockCopy,
  InlineCode,
  Button,
  Field,
  Input,
  NativeSelect,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableCaption,
  TableContainer,
  type InlineCodeProps,
  type CodeBlockProps,
  type ControlSize
} from '@cognitap/radiant'

export type CodeBlockTaskOptions = Pick<
  CodeBlockProps,
  'className' | 'style' | 'lineNumbers' | 'loadingText' | 'copiedText' | 'errorText' | 'parts'
> & {
  dir?: 'ltr' | 'rtl'
  controlSize?: ControlSize
  disabled?: boolean
  highlight?: boolean
  applicationLabel?: string
  termProps?: Pick<InlineCodeProps, 'className' | 'style'>
}
const appStyle = {
  display: 'grid',
  gap: '1rem',
  width: '100%',
  maxWidth: '40rem',
  minWidth: 0
} as const
/** A tiny consumer renderer; production applications can supply nodes from their own engine. */
function quotedStrings(source: string) {
  return source.split(/("(?:\\.|[^"\\])*")/g).map((text, index) =>
    text.startsWith('"') ? (
      <span
        key={index}
        style={{ fontWeight: 650, textDecoration: 'underline', textUnderlineOffset: '0.16em' }}
      >
        {text}
      </span>
    ) : (
      text
    )
  )
}
function SourceSample({
  source,
  language,
  label,
  copyLabel,
  controlSize = 'medium',
  disabled,
  highlight = false,
  applicationLabel,
  ...options
}: Omit<CodeBlockTaskOptions, 'termProps'> & {
  source: string
  language: string
  label: string
  copyLabel: string
}) {
  return (
    <CodeBlock
      {...options}
      code={source}
      language={language}
    >
      <CodeBlockHeader>
        <span>{label}</span>
        <CodeBlockCopy
          controlSize={controlSize}
          disabled={disabled}
        >
          {copyLabel}
        </CodeBlockCopy>
      </CodeBlockHeader>
      <CodeBlockViewport aria-label={applicationLabel ? applicationLabel + ': ' + label : label}>
        <CodeBlockContent>
          {highlight && language === 'json' ? quotedStrings(source) : undefined}
        </CodeBlockContent>
      </CodeBlockViewport>
    </CodeBlock>
  )
}
export function CodeBlockPreview({
  code = "const message = 'Hello, Radiant.'\nconsole.log(message)\n",
  language = 'typescript',
  ...options
}: Omit<CodeBlockTaskOptions, 'termProps'> & { code?: string; language?: string }) {
  return (
    <SourceSample
      {...options}
      source={code}
      language={language}
      label="Greeting source"
      copyLabel="Copy code"
    />
  )
}
const managers = ['pnpm', 'npm', 'yarn'] as const
const commands = {
  pnpm: 'pnpm add @cognitap/radiant',
  npm: 'npm install @cognitap/radiant',
  yarn: 'yarn add @cognitap/radiant'
}
export function InstallRadiant({
  applicationLabel = 'Package installation',
  termProps,
  ...options
}: CodeBlockTaskOptions) {
  const [manager, setManager] = useState<(typeof managers)[number]>('pnpm')
  return (
    <section
      aria-label={applicationLabel}
      dir={options.dir}
      style={appStyle}
    >
      <Field label="Package manager">
        <NativeSelect
          controlSize={options.controlSize}
          value={manager}
          onChange={event => {
            const next = managers.find(item => item === event.currentTarget.value)
            if (next) setManager(next)
          }}
        >
          {managers.map(item => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <p>
        Add <InlineCode {...termProps}>@cognitap/radiant</InlineCode> to your application, then
        import <InlineCode {...termProps}>@cognitap/radiant/styles.css</InlineCode>.
      </p>
      <SourceSample
        {...options}
        applicationLabel={applicationLabel}
        source={commands[manager]}
        language="shell"
        label="Install command"
        copyLabel="Copy install command"
      />
    </section>
  )
}
export function ConfigureStudyExport({
  applicationLabel = 'Export configuration',
  termProps,
  highlight = true,
  ...options
}: CodeBlockTaskOptions) {
  const [configuration, setConfiguration] = useState({
    collection: 'reading_sessions',
    timings: true
  })
  const plan = {
    collection: configuration.collection,
    fields: configuration.timings
      ? ['participantId', 'accuracy', 'durationMs']
      : ['participantId', 'accuracy'],
    limit: 100
  }
  const source = JSON.stringify(plan, null, 2) + '\n'
  return (
    <form
      aria-label={applicationLabel}
      dir={options.dir}
      style={appStyle}
      onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget),
          collection = data.get('collection')
        if (typeof collection === 'string')
          setConfiguration({ collection, timings: data.get('timings') === 'yes' })
      }}
    >
      <Field
        label="Collection"
        description="Use lowercase letters and underscores."
      >
        <Input
          name="collection"
          defaultValue="reading_sessions"
          required
          pattern="[a-z_]+"
          controlSize={options.controlSize}
        />
      </Field>
      <Checkbox
        name="timings"
        value="yes"
        defaultChecked
        label="Include session timings"
        controlSize={options.controlSize}
      />
      <Button
        type="submit"
        controlSize={options.controlSize}
      >
        Generate export configuration
      </Button>
      <output
        aria-label="Generated export plan"
        aria-live="polite"
      >
        Export plan: <InlineCode {...termProps}>{configuration.collection}</InlineCode>,{' '}
        {plan.fields.length} fields, up to 100 records.
      </output>
      <SourceSample
        {...options}
        applicationLabel={applicationLabel}
        highlight={highlight}
        source={source}
        language="json"
        label="export.json"
        copyLabel="Copy export configuration"
      />
    </form>
  )
}
const sessions = [
  {
    id: 'S-104',
    participant: 'Maya',
    status: 'Completed',
    accuracy: 96,
    note: 'Participant compared two reading passages, reviewed the comprehension questions, and confirmed that the longer paragraph was easier to follow after increasing the text spacing.'
  },
  {
    id: 'S-105',
    participant: 'Jonas',
    status: 'In progress',
    accuracy: 84,
    note: 'Participant paused after the first passage.'
  },
  {
    id: 'S-106',
    participant: 'Alex',
    status: 'Completed',
    accuracy: 91,
    note: 'Participant requested "larger text", then finished the reading task.'
  }
]
function csvValue(value: string | number) {
  return '"' + String(value).replaceAll('"', '""') + '"'
}
export function InspectSessionExport({
  applicationLabel = 'Session export',
  termProps,
  lineNumbers = true,
  ...options
}: CodeBlockTaskOptions) {
  const [completed, setCompleted] = useState(false)
  const visible = completed ? sessions.filter(item => item.status === 'Completed') : sessions
  const rows = [
    ['sessionId', 'participant', 'status', 'accuracy', 'note'],
    ...visible.map(item => [item.id, item.participant, item.status, item.accuracy, item.note])
  ]
  const source = rows.map(row => row.map(csvValue).join(',')).join('\r\n') + '\r\n'
  return (
    <section
      aria-label={applicationLabel}
      dir={options.dir}
      style={appStyle}
    >
      <Checkbox
        label="Completed sessions only"
        checked={completed}
        onChange={event => setCompleted(event.currentTarget.checked)}
        controlSize={options.controlSize}
      />
      <TableContainer aria-label="Session records">
        <Table style={{ minWidth: '28rem' }}>
          <TableCaption>{visible.length} session records</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeader scope="col">Session</TableHeader>
              <TableHeader scope="col">Participant</TableHeader>
              <TableHeader scope="col">Status</TableHeader>
              <TableHeader scope="col">Accuracy</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.participant}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.accuracy}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <p>
        The <InlineCode {...termProps}>note</InlineCode> field stays on one line. Focus the code
        viewport and use the arrow keys to inspect the complete CSV.
      </p>
      <SourceSample
        {...options}
        applicationLabel={applicationLabel}
        lineNumbers={lineNumbers}
        source={source}
        language="csv"
        label="sessions.csv"
        copyLabel="Copy session CSV"
      />
    </section>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type CodeBlockTask = 'install' | 'configuration' | 'export'
export function CodeBlockExample({
  task = 'install',
  ...options
}: CodeBlockTaskOptions & { task?: CodeBlockTask }) {
  return (
    <MotionProvider>
      {task === 'configuration' ? (
        <ConfigureStudyExport {...options} />
      ) : task === 'export' ? (
        <InspectSessionExport {...options} />
      ) : (
        <InstallRadiant {...options} />
      )}
    </MotionProvider>
  )
}
