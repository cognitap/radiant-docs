'use client'
import { useId, useRef, useState } from 'react'
import {
  Toolbar,
  Button,
  Link,
  ToggleGroup,
  ToggleGroupItem,
  Separator,
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuContent,
  MenuItem,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  Checkbox,
  Field,
  Textarea,
  type ToolbarProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
type Options = Pick<ToolbarProps, 'orientation' | 'loop' | 'dir' | 'className' | 'style'>
const layout = {
  display: 'grid',
  gap: '1rem',
  width: 'min(36rem, calc(100vw - 2rem))',
  maxWidth: '100%'
}

import '@cognitap/radiant/styles.css'
export type ToolbarTask = 'editor' | 'documents' | 'resources' | 'canvas'
export function ToolbarExample({ task = 'editor', ...options }: Options & { task?: ToolbarTask }) {
  return (
    <MotionProvider>
      {task === 'documents' ? (
        <DocumentActions {...options} />
      ) : task === 'resources' ? (
        <Resources {...options} />
      ) : task === 'canvas' ? (
        <CanvasTools {...options} />
      ) : (
        <Editor {...options} />
      )}
    </MotionProvider>
  )
}
function Editor(options: Options) {
  const [text, setText] = useState('Make the next step clear.'),
    [history, setHistory] = useState<string[]>([]),
    [format, setFormat] = useState(['bold']),
    [message, setMessage] = useState('No export requested.')
  return (
    <div style={layout}>
      <Toolbar
        {...options}
        aria-label="Document editor"
      >
        <Button
          variant="outline"
          disabled={history.length === 0}
          onClick={() => {
            const previous = history.at(-1)
            if (previous !== undefined) {
              setText(previous)
              setHistory(history.slice(0, -1))
            }
          }}
        >
          Undo
        </Button>
        <Separator
          decorative
          orientation={options.orientation === 'vertical' ? 'horizontal' : 'vertical'}
        />
        <ToggleGroup
          aria-label="Formatting"
          type="multiple"
          defaultValue={['bold']}
          orientation={options.orientation}
          onValueChange={setFormat}
        >
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        </ToggleGroup>
        <Menu>
          <MenuTrigger variant="outline">More</MenuTrigger>
          <MenuPortal>
            <MenuContent>
              <MenuItem
                onSelect={() => setMessage(`Export requested for ${text.length} characters.`)}
              >
                Export document
              </MenuItem>
              <MenuItem
                onSelect={() => {
                  setHistory([...history, text])
                  setText('')
                }}
              >
                Clear draft
              </MenuItem>
            </MenuContent>
          </MenuPortal>
        </Menu>
      </Toolbar>
      <Field label="Draft">
        <Textarea
          value={text}
          onChange={event => {
            setHistory([...history, text])
            setText(event.target.value)
          }}
          style={{
            fontWeight: format.includes('bold') ? 700 : 400,
            fontStyle: format.includes('italic') ? 'italic' : 'normal'
          }}
        />
      </Field>
      <output aria-live="polite">{message}</output>
    </div>
  )
}
function DocumentActions(options: Options) {
  const [drafts, setDrafts] = useState(1),
    [pending, setPending] = useState(false),
    [density, setDensity] = useState<string | null>('comfortable'),
    [message, setMessage] = useState('Draft ready.')
  return (
    <div style={layout}>
      <Toolbar
        {...options}
        aria-label="Document actions"
      >
        <Button
          variant="outline"
          onClick={() => setDrafts(drafts + 1)}
        >
          New draft
        </Button>
        <Dialog>
          <DialogTrigger variant="outline">Reading settings</DialogTrigger>
          <DialogContent>
            <DialogTitle>Reading settings</DialogTitle>
            <ToggleGroup
              aria-label="Reading density"
              appearance="segmented"
              defaultValue="comfortable"
              onValueChange={setDensity}
            >
              <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
              <ToggleGroupItem value="comfortable">Comfortable</ToggleGroupItem>
            </ToggleGroup>
            <p style={{ lineHeight: density === 'compact' ? 1.2 : 1.8 }}>
              Related actions keep their own keyboard navigation inside the dialog.
            </p>
            <DialogClose>Done</DialogClose>
          </DialogContent>
        </Dialog>
        <Button
          pending={pending}
          onClick={() => setMessage('Publish requested.')}
        >
          Publish
        </Button>
      </Toolbar>
      <Checkbox
        label="Publishing in progress"
        checked={pending}
        onChange={event => setPending(event.target.checked)}
      />
      <output aria-live="polite">
        {drafts} drafts. {message}
      </output>
    </div>
  )
}
function Resources(options: Options) {
  const id = useId(),
    [refreshes, setRefreshes] = useState(0)
  return (
    <div style={layout}>
      <Toolbar
        {...options}
        aria-label="Project resources"
        style={{
          '--rad-toolbar-padding': '.5rem',
          '--rad-toolbar-background': 'var(--rad-color-neutral)',
          ...options.style
        }}
      >
        <Button
          variant="ghost"
          onClick={() => setRefreshes(refreshes + 1)}
        >
          Refresh project
        </Button>
        <Separator
          decorative
          orientation={options.orientation === 'vertical' ? 'horizontal' : 'vertical'}
        />
        <Link
          href={`#${id}-brief`}
          variant="soft"
          tone="neutral"
        >
          Read brief
        </Link>
        <Link
          href={`#${id}-notes`}
          variant="soft"
          tone="neutral"
        >
          Meeting notes
        </Link>
      </Toolbar>
      <output aria-live="polite">Refreshed {refreshes} times.</output>
      <section
        id={`${id}-brief`}
        tabIndex={-1}
      >
        <h3>Project brief</h3>
        <p>Build a quieter workspace.</p>
      </section>
      <section
        id={`${id}-notes`}
        tabIndex={-1}
      >
        <h3>Meeting notes</h3>
        <p>Keep commands and navigation distinct.</p>
      </section>
    </div>
  )
}
function CanvasTools(options: Options) {
  const id = useId(),
    ref = useRef<HTMLDivElement>(null),
    [tool, setTool] = useState('move')
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'start',
        flexWrap: 'wrap',
        gap: '1rem',
        maxWidth: '100%'
      }}
    >
      <div style={{ display: 'grid', gap: '1rem' }}>
        <h3
          id={id}
          style={{ margin: 0 }}
        >
          Canvas tools
        </h3>
        <Toolbar
          {...options}
          orientation={options.orientation ?? 'vertical'}
          loop={options.loop ?? false}
          ref={ref}
          aria-label={undefined}
          aria-labelledby={id}
        >
          {['move', 'select', 'draw'].map(value => (
            <Button
              key={value}
              variant="outline"
              pressed={tool === value}
              onPressedChange={pressed => {
                if (pressed) setTool(value)
              }}
            >
              {value === 'move' ? 'Move' : value === 'select' ? 'Select' : 'Draw'}
            </Button>
          ))}
        </Toolbar>
        <Button
          variant="ghost"
          onClick={() => ref.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()}
        >
          Focus canvas tools
        </Button>
      </div>
      <section
        aria-label="Canvas preview"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '16rem',
          height: '12rem',
          border: '1px solid var(--rad-color-border)',
          borderRadius: 'var(--rad-control-radius)',
          background: 'var(--rad-color-surface)'
        }}
      >
        <output aria-live="polite">{tool} tool selected</output>
      </section>
    </div>
  )
}
