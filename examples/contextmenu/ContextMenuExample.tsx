'use client'
import { useId, useRef, useState } from 'react'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPortal,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  Button,
  Checkbox,
  Field,
  Input,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  type ContextMenuContentProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
type Options = Pick<
  ContextMenuContentProps,
  'side' | 'align' | 'sideOffset' | 'collisionPadding' | 'motion' | 'className' | 'style'
> & { dir?: 'ltr' | 'rtl'; initialOpen?: boolean }
const layout = {
  display: 'grid',
  gap: '1rem',
  width: 'min(32rem,calc(100vw - 2rem))',
  maxWidth: '100%'
}
const targetStyle = {
  display: 'grid',
  gap: '1rem',
  padding: '1.5rem',
  border: '1px solid var(--rad-color-border)',
  borderRadius: 'var(--rad-control-radius)',
  background: 'var(--rad-color-surface)'
}

import '@cognitap/radiant/styles.css'
export type ContextMenuTask = 'file' | 'canvas' | 'report'
export function ContextMenuExample({
  task = 'file',
  ...options
}: Options & { task?: ContextMenuTask }) {
  return (
    <MotionProvider>
      {task === 'canvas' ? (
        <CanvasSettings {...options} />
      ) : task === 'report' ? (
        <ReportReview {...options} />
      ) : (
        <FileActions {...options} />
      )}
    </MotionProvider>
  )
}
function FileActions({ dir, initialOpen, ...surface }: Options) {
  const [name, setName] = useState('Project brief'),
    [message, setMessage] = useState('No file action requested.'),
    ref = useRef<HTMLDivElement>(null)
  const rename = () => {
      setName(previous => (previous.endsWith(' revised') ? previous : previous + ' revised'))
      setMessage('File renamed.')
    },
    duplicate = () => setMessage(`Copy of ${name} created.`)
  return (
    <div
      style={layout}
      dir={dir}
    >
      <p>
        Right-click, hold on touch, or focus the file and press Shift+F10. The same commands are
        available below.
      </p>
      <ContextMenu defaultOpen={initialOpen}>
        <ContextMenuTrigger
          ref={ref}
          aria-label="Project file"
          style={targetStyle}
        >
          <strong>{name}</strong>
          <span>Shared workspace · Edited today</span>
        </ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent {...surface}>
            <ContextMenuItem onSelect={rename}>Rename</ContextMenuItem>
            <ContextMenuItem onSelect={duplicate}>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem disabled>Archive locked file</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button onClick={rename}>Rename file</Button>
        <Button
          variant="outline"
          onClick={duplicate}
        >
          Duplicate file
        </Button>
        <Button
          variant="ghost"
          onClick={() => ref.current?.focus()}
        >
          Focus file
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </div>
  )
}
function CanvasSettings({ dir, initialOpen, ...surface }: Options) {
  const label = useId(),
    [grid, setGrid] = useState(true),
    [layout, setLayout] = useState<string | null>('columns'),
    [destination, setDestination] = useState('Personal space')
  return (
    <div
      style={{ ...targetStyle, width: 'min(40rem,calc(100vw - 2rem))' }}
      dir={dir}
    >
      <ContextMenu defaultOpen={initialOpen}>
        <ContextMenuTrigger
          aria-label="Planning canvas"
          style={{
            ...targetStyle,
            minHeight: 180,
            backgroundImage: grid
              ? 'linear-gradient(var(--rad-color-border) 1px,transparent 1px),linear-gradient(90deg,var(--rad-color-border) 1px,transparent 1px)'
              : undefined,
            backgroundSize: '24px 24px'
          }}
        >
          <strong>Website launch</strong>
          <span>
            {layout === 'columns'
              ? 'Research · Design · Delivery'
              : 'Research, design and delivery'}
          </span>
        </ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent {...surface}>
            <ContextMenuGroup aria-labelledby={label}>
              <ContextMenuLabel id={label}>Canvas view</ContextMenuLabel>
              <ContextMenuCheckboxItem
                checked={grid}
                onCheckedChange={setGrid}
              >
                Grid lines
              </ContextMenuCheckboxItem>
              <ContextMenuRadioGroup
                aria-label="Canvas layout"
                value={layout}
                onValueChange={setLayout}
              >
                <ContextMenuRadioItem value="columns">Columns</ContextMenuRadioItem>
                <ContextMenuRadioItem value="list">List</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
              <ContextMenuPortal>
                <ContextMenuSubContent motion={surface.motion}>
                  <ContextMenuItem onSelect={() => setDestination('Personal space')}>
                    Personal space
                  </ContextMenuItem>
                  <ContextMenuItem onSelect={() => setDestination('Design team')}>
                    Design team
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuPortal>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
      <Checkbox
        label="Show grid lines"
        checked={grid}
        onChange={event => setGrid(event.target.checked)}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button
          variant="outline"
          pressed={layout === 'columns'}
          onPressedChange={() => setLayout('columns')}
        >
          Columns layout
        </Button>
        <Button
          variant="outline"
          pressed={layout === 'list'}
          onPressedChange={() => setLayout('list')}
        >
          List layout
        </Button>
        <Button
          variant="ghost"
          onClick={() => setDestination('Design team')}
        >
          Move to design team
        </Button>
      </div>
      <output aria-live="polite">Saved in {destination}.</output>
    </div>
  )
}
function ReportReview({ dir, initialOpen, ...surface }: Options) {
  const [open, setOpen] = useState(initialOpen ?? false),
    [keep, setKeep] = useState(false),
    [pending, setPending] = useState(false),
    [review, setReview] = useState(false),
    [name, setName] = useState('Quarterly review'),
    [message, setMessage] = useState('No report prepared.')
  const prepare = () =>
    setMessage(review ? 'Review the report before exporting.' : `Exported ${name}.`)
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Dialog>
        <DialogTrigger variant="outline">Review report</DialogTrigger>
        <DialogContent>
          <DialogTitle>Prepare a report</DialogTitle>
          <DialogDescription>Review the title and choose an export command.</DialogDescription>
          <div style={{ display: 'grid', gap: 16 }}>
            <Field label="Report title">
              <Input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </Field>
            <Checkbox
              label="Keep report menu open"
              checked={keep}
              onChange={event => setKeep(event.target.checked)}
            />
            <Checkbox
              label="Review before exporting"
              checked={review}
              onChange={event => setReview(event.target.checked)}
            />
            <Checkbox
              label="Export in progress"
              checked={pending}
              onChange={event => setPending(event.target.checked)}
            />
            <ContextMenu
              open={open}
              onOpenChange={next => {
                if (next || !keep) setOpen(next)
              }}
            >
              <ContextMenuTrigger
                aria-label="Report preview"
                style={targetStyle}
              >
                <strong>{name}</strong>
                <span>Context commands are also available below.</span>
              </ContextMenuTrigger>
              <ContextMenuPortal>
                <ContextMenuContent {...surface}>
                  <ContextMenuItem
                    pending={pending}
                    onSelect={event => {
                      prepare()
                      if (review) event.preventDefault()
                    }}
                  >
                    Export report
                  </ContextMenuItem>
                  <ContextMenuItem
                    closeOnSelect={false}
                    onSelect={() => setMessage('Preview is ready.')}
                  >
                    Show preview
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenuPortal>
            </ContextMenu>
            <Button
              pending={pending}
              onClick={prepare}
            >
              Export report directly
            </Button>
            <Button
              variant="outline"
              onClick={() => setMessage('Preview is ready.')}
            >
              Show preview directly
            </Button>
            <output aria-live="polite">{message}</output>
            <DialogClose variant="ghost">Finish review</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
