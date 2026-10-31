'use client'
import { useState } from 'react'
import {
  Button,
  Checkbox,
  Field,
  Textarea,
  ScrollArea,
  CodeBlock,
  CodeBlockHeader,
  CodeBlockViewport,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  Resizable,
  ResizablePanel,
  ResizableHandle,
  useResizable,
  type ResizableProps,
  type ResizableItem,
  type ThemeStyle
} from '@cognitap/radiant'

export type ResizableTaskOptions = Pick<
  ResizableProps,
  'orientation' | 'disabled' | 'dir' | 'className' | 'style'
> & { step?: number; largeStep?: number; handleClassName?: string; handleStyle?: ThemeStyle }
const shell = { display: 'grid', gap: '1rem', width: 'min(54rem,100%)', minWidth: 0 }
const pane = {
  display: 'grid',
  alignContent: 'start',
  gap: '0.75rem',
  padding: '1rem',
  minWidth: 0
}
const layout = {
  height: '26rem',
  width: '100%',
  minWidth: 0,
  border: '1px solid var(--rad-color-border)',
  borderRadius: '0.5rem',
  overflow: 'hidden'
}
const rootOptions = ({ orientation, disabled, dir, className, style }: ResizableTaskOptions) => ({
  orientation,
  disabled,
  dir,
  className,
  style
})
const handleOptions = ({
  step,
  largeStep,
  handleClassName,
  handleStyle
}: ResizableTaskOptions) => ({ step, largeStep, className: handleClassName, style: handleStyle })
function SizingActions({ panel, label }: { panel: string; label: string }) {
  const group = useResizable()
  if (!group) throw new Error('SizingActions requires Resizable.')
  const value = group.getPanel(panel)
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Button
        controlSize="small"
        variant="outline"
        tone="neutral"
        disabled={group.disabled || value.size <= value.min}
        aria-controls={value.id}
        onClick={() => group.resizeBy(panel, -5)}
      >
        Narrow {label}
      </Button>
      <Button
        controlSize="small"
        variant="outline"
        tone="neutral"
        disabled={group.disabled || value.size >= value.max}
        aria-controls={value.id}
        onClick={() => group.resizeBy(panel, 5)}
      >
        Widen {label}
      </Button>
      <Button
        controlSize="small"
        variant="outline"
        tone="neutral"
        aria-controls={value.id}
        aria-expanded={!value.collapsed}
        disabled={group.disabled || !(value.collapsed ? value.canExpand : value.canCollapse)}
        onClick={() => group.toggle(panel)}
      >
        {value.collapsed ? 'Restore' : 'Collapse'} {label}
      </Button>
    </div>
  )
}
const fileItems: ResizableItem[] = [
  { value: 'files', min: 20, max: 50, collapsible: true },
  { value: 'preview', min: 40, max: 100 }
]
const files = [
  {
    id: 'consent',
    name: 'consent.md',
    source:
      '# Participant consent\n\nExplain the study, expected duration and right to stop.\nRecord consent before starting the reading task.'
  },
  {
    id: 'session',
    name: 'session.json',
    source:
      '{\n  "task": "reading-comprehension",\n  "durationMinutes": 15,\n  "recordAudio": false\n}'
  },
  {
    id: 'questions',
    name: 'questions.txt',
    source:
      'Which passage was easier to follow?\nWhat made the second paragraph clearer?\nWould you change the text spacing?'
  }
]
export function ReviewProjectFiles(options: ResizableTaskOptions) {
  const [selected, setSelected] = useState(files[0]!)
  return (
    <section
      aria-label="Project file workspace"
      dir={options.dir}
      style={shell}
    >
      <p style={{ margin: 0 }}>
        Choose a project document. Drag the divider or use the buttons to change the file pane.
      </p>
      <Resizable
        {...rootOptions(options)}
        items={fileItems}
        defaultValue={[32, 68]}
        style={{ ...layout, ...options.style }}
      >
        <ResizablePanel value="files">
          <ScrollArea
            aria-label="Project files"
            style={{ height: '100%' }}
          >
            <div style={{ ...pane, minWidth: '12rem' }}>
              <h3 style={{ margin: 0 }}>Project files</h3>
              {files.map(file => (
                <Button
                  key={file.id}
                  controlSize="small"
                  variant={file.id === selected.id ? 'soft' : 'ghost'}
                  tone="neutral"
                  onClick={() => setSelected(file)}
                >
                  {file.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle
          value="files"
          aria-label="Project files"
          {...handleOptions(options)}
        />
        <ResizablePanel value="preview">
          <ScrollArea
            aria-label="Document preview"
            style={{ height: '100%' }}
          >
            <div style={pane}>
              <SizingActions
                panel="files"
                label="files"
              />
              <h3 style={{ margin: 0 }}>{selected.name}</h3>
              <CodeBlock code={selected.source}>
                <CodeBlockHeader>Document source</CodeBlockHeader>
                <CodeBlockViewport aria-label="Selected document source" />
              </CodeBlock>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </Resizable>
    </section>
  )
}
const noteItems: ResizableItem[] = [
  { value: 'editor', min: 25, max: 80 },
  { value: 'preview', min: 20, max: 75 }
]
export function EditInterviewNotes({ orientation = 'vertical', ...options }: ResizableTaskOptions) {
  const [notes, setNotes] = useState(
    'The participant compared both reading passages.\n\nLarger text spacing made the second paragraph easier to follow.'
  )
  const [snapshot, setSnapshot] = useState('')
  const words = notes.trim() ? notes.trim().split(/\s+/).length : 0
  return (
    <section
      aria-label="Interview notes workspace"
      dir={options.dir}
      style={shell}
    >
      <Resizable
        {...rootOptions(options)}
        orientation={orientation}
        items={noteItems}
        defaultValue={[55, 45]}
        style={{ ...layout, height: '34rem', ...options.style }}
      >
        <ResizablePanel value="editor">
          <ScrollArea
            aria-label="Interview note editor"
            style={{ height: '100%' }}
          >
            <div style={pane}>
              <Field
                label="Interview notes"
                description="The preview follows the native text value."
              >
                <Textarea
                  value={notes}
                  onChange={event => setNotes(event.currentTarget.value)}
                  rows={7}
                  style={{ resize: 'none' }}
                />
              </Field>
              <Button
                controlSize="small"
                onClick={() => setSnapshot(JSON.stringify({ wordCount: words, notes }, null, 2))}
              >
                Prepare note snapshot
              </Button>
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle
          value="editor"
          aria-label="Interview note editor"
          {...handleOptions(options)}
        />
        <ResizablePanel value="preview">
          <ScrollArea
            aria-label="Interview note preview"
            style={{ height: '100%' }}
          >
            <div style={pane}>
              <h3 style={{ margin: 0 }}>Interview note preview</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <NoteSizingActions />
              </div>
              <output aria-live="off">{words} words</output>
              {notes
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p
                    key={index}
                    style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                  >
                    {paragraph}
                  </p>
                ))}
              {snapshot ? (
                <CodeBlock code={snapshot}>
                  <CodeBlockHeader>Prepared note snapshot</CodeBlockHeader>
                  <CodeBlockViewport aria-label="Note snapshot JSON" />
                </CodeBlock>
              ) : null}
            </div>
          </ScrollArea>
        </ResizablePanel>
      </Resizable>
    </section>
  )
}
function NoteSizingActions() {
  const group = useResizable()
  if (!group) throw new Error('NoteSizingActions requires Resizable.')
  const editor = group.getPanel('editor')
  return (
    <>
      <Button
        controlSize="small"
        variant="outline"
        tone="neutral"
        disabled={group.disabled || editor.size >= editor.max}
        onClick={() => group.resizeBy('editor', 5)}
      >
        More editor space
      </Button>
      <Button
        controlSize="small"
        variant="outline"
        tone="neutral"
        disabled={group.disabled || editor.size <= editor.min}
        onClick={() => group.resizeBy('editor', -5)}
      >
        More preview space
      </Button>
    </>
  )
}
const savedItems: ResizableItem[] = [
  { value: 'navigation', min: 15, max: 40, collapsible: true },
  { value: 'records', min: 30, max: 70 },
  { value: 'inspector', min: 15, max: 40 }
]
const initial = [20, 50, 30],
  storageKey = 'radiant-example-resizable-workspace'
function savedValue(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every(
      (size, index) =>
        typeof size === 'number' &&
        Number.isFinite(size) &&
        ((size === 0 && savedItems[index]!.collapsible) ||
          (size >= (savedItems[index]!.min ?? 0) && size <= (savedItems[index]!.max ?? 100)))
    ) &&
    Math.abs(value.reduce((sum, size) => sum + size, 0) - 100) < 1e-7
  )
}
const records = [
  { id: 'S-104', name: 'Maya', accuracy: 96 },
  { id: 'S-106', name: 'Alex', accuracy: 91 },
  { id: 'S-109', name: 'Sam', accuracy: 94 }
]
export function RestoreWorkspaceLayout(options: ResizableTaskOptions) {
  const [sizes, setSizes] = useState(initial),
    [keepNavigation, setKeepNavigation] = useState(true),
    [feedback, setFeedback] = useState(''),
    [selected, setSelected] = useState(records[0]!)
  return (
    <section
      aria-label="Saved research workspace"
      dir={options.dir}
      style={shell}
    >
      <Checkbox
        label="Keep navigation visible"
        checked={keepNavigation}
        onChange={event => setKeepNavigation(event.currentTarget.checked)}
      />
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
          controlSize="small"
          onClick={event => {
            try {
              event.currentTarget.ownerDocument.defaultView!.localStorage.setItem(
                storageKey,
                JSON.stringify(sizes)
              )
              setFeedback('Workspace layout saved.')
            } catch {
              setFeedback('This browser could not save the workspace layout.')
            }
          }}
        >
          Save layout
        </Button>
        <Button
          controlSize="small"
          variant="outline"
          tone="neutral"
          onClick={event => {
            try {
              const stored =
                  event.currentTarget.ownerDocument.defaultView!.localStorage.getItem(storageKey),
                value: unknown = stored ? JSON.parse(stored) : null
              if (!savedValue(value)) {
                setFeedback('No valid saved layout is available.')
                return
              }
              if (keepNavigation && value[0] === 0) {
                setFeedback('Keep navigation visible is enabled.')
                return
              }
              setSizes(value)
              setFeedback('Saved workspace layout restored.')
            } catch {
              setFeedback('This browser could not restore the workspace layout.')
            }
          }}
        >
          Restore saved layout
        </Button>
        <Button
          controlSize="small"
          variant="outline"
          tone="neutral"
          onClick={() => {
            setSizes(initial)
            setFeedback('Default workspace layout restored.')
          }}
        >
          Reset layout
        </Button>
      </div>
      <Resizable
        {...rootOptions(options)}
        items={savedItems}
        value={sizes}
        onValueChange={value => {
          if (keepNavigation && value[0] === 0) {
            setFeedback('Keep navigation visible is enabled.')
            return
          }
          setSizes(value)
          setFeedback('')
        }}
        style={{ ...layout, height: '28rem', ...options.style }}
      >
        <ResizablePanel value="navigation">
          <ScrollArea
            aria-label="Workspace navigation"
            style={{ height: '100%' }}
          >
            <div style={{ ...pane, minWidth: '10rem' }}>
              <h3 style={{ margin: 0 }}>Research sessions</h3>
              <p>Review completed reading tasks, then inspect a participant record.</p>
              <output aria-live="off">Navigation: {Number(sizes[0]!.toFixed(1))}%</output>
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle
          value="navigation"
          aria-label="Workspace navigation"
          {...handleOptions(options)}
        />
        <ResizablePanel value="records">
          <ScrollArea
            aria-label="Participant records"
            style={{ height: '100%' }}
          >
            <div style={pane}>
              <SizingActions
                panel="navigation"
                label="navigation"
              />
              <Table style={{ minWidth: '26rem' }}>
                <TableCaption>Completed reading sessions</TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Participant</TableHeader>
                    <TableHeader>Accuracy</TableHeader>
                    <TableHeader>Record</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.accuracy}%</TableCell>
                      <TableCell>
                        <Button
                          controlSize="small"
                          variant="outline"
                          tone="neutral"
                          onClick={() => setSelected(record)}
                        >
                          Inspect {record.name}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle
          value="records"
          aria-label="Participant records"
          {...handleOptions(options)}
        />
        <ResizablePanel value="inspector">
          <ScrollArea
            aria-label="Session record inspector"
            style={{ height: '100%' }}
          >
            <div style={pane}>
              <h3 style={{ margin: 0 }}>Inspecting {selected.name}</h3>
              <CodeBlock code={JSON.stringify(selected, null, 2)}>
                <CodeBlockViewport aria-label="Selected participant JSON" />
              </CodeBlock>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </Resizable>
      <output
        aria-label="Workspace layout feedback"
        aria-live="polite"
      >
        {feedback}
      </output>
    </section>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type ResizableTask = 'files' | 'notes' | 'saved'
export function ResizableExample({
  task = 'files',
  ...options
}: ResizableTaskOptions & { task?: ResizableTask }) {
  return (
    <MotionProvider>
      {task === 'notes' ? (
        <EditInterviewNotes {...options} />
      ) : task === 'saved' ? (
        <RestoreWorkspaceLayout {...options} />
      ) : (
        <ReviewProjectFiles {...options} />
      )}
    </MotionProvider>
  )
}
