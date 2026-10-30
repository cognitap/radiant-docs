'use client'
import { useId, useRef, useState } from 'react'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarPortal,
  MenubarContent,
  MenubarItem,
  MenubarGroup,
  MenubarLabel,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  Button,
  Checkbox,
  Field,
  Input,
  type MenubarContentProps,
  type MenubarRenderProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
type Options = Pick<
  MenubarContentProps,
  'side' | 'align' | 'sideOffset' | 'collisionPadding' | 'motion' | 'className' | 'style'
> & {
  dir?: 'ltr' | 'rtl'
  loop?: boolean
  initialOpen?: boolean
  disabled?: boolean
  pending?: boolean
}
const layout = {
  display: 'grid',
  gap: '1rem',
  width: 'min(36rem,calc(100vw - 2rem))',
  maxWidth: '100%'
}

import '@cognitap/radiant/styles.css'
export type MenubarTask = 'document' | 'board' | 'report'
export function MenubarExample({
  task = 'document',
  ...options
}: Options & { task?: MenubarTask }) {
  return (
    <MotionProvider>
      {task === 'board' ? (
        <PlanningBoard {...options} />
      ) : task === 'report' ? (
        <ReportActions {...options} />
      ) : (
        <DocumentCommands {...options} />
      )}
    </MotionProvider>
  )
}
function DocumentCommands({ dir, loop, initialOpen, disabled, pending, ...surface }: Options) {
  const label = useId(),
    [name, setName] = useState('Project brief'),
    [saved, setSaved] = useState(false),
    [readOnly, setReadOnly] = useState(false),
    [count, setCount] = useState(true),
    [message, setMessage] = useState('Draft has unsaved changes.')
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Field label="Document title">
        <Input
          value={name}
          onChange={event => {
            setName(event.target.value)
            setSaved(false)
          }}
        />
      </Field>
      <Checkbox
        label="Read-only document"
        checked={readOnly}
        onChange={event => setReadOnly(event.target.checked)}
      />
      <Menubar
        aria-label="Document commands"
        loop={loop}
        defaultValue={initialOpen ? 'file' : null}
      >
        <MenubarMenu value="file">
          <MenubarTrigger pending={pending}>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarGroup aria-labelledby={label}>
                <MenubarLabel id={label}>Current document</MenubarLabel>
                <MenubarItem
                  disabled={disabled || readOnly}
                  pending={pending}
                  onSelect={() => {
                    setSaved(true)
                    setMessage(`Saved ${name}.`)
                  }}
                >
                  Save
                </MenubarItem>
                <MenubarItem
                  disabled={disabled}
                  onSelect={() => {
                    setName(`${name} (copy)`)
                    setSaved(false)
                    setMessage('Working on a local copy.')
                  }}
                >
                  Duplicate
                </MenubarItem>
              </MenubarGroup>
              <MenubarSeparator />
              <MenubarItem onSelect={() => setMessage('Document prepared for printing.')}>
                Print
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger disabled={disabled || readOnly}>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarItem
                disabled={!saved}
                onSelect={() => {
                  setSaved(false)
                  setMessage('Last save undone locally.')
                }}
              >
                Undo save
              </MenubarItem>
              <MenubarItem onSelect={() => setMessage('Document title selected for editing.')}>
                Edit title
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarCheckboxItem
                checked={count}
                onCheckedChange={setCount}
              >
                Word count
              </MenubarCheckboxItem>
              <MenubarItem
                closeOnSelect={false}
                onSelect={() => setMessage('Preview refreshed. Choose another command.')}
              >
                Refresh preview
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <section
        aria-label="Document preview"
        style={{
          padding: '1.5rem',
          border: '1px solid var(--rad-color-border)',
          borderRadius: '.75rem'
        }}
      >
        <h3 style={{ marginTop: 0 }}>{name}</h3>
        <p>A clear plan gives the team room to make good decisions.</p>
        {count && <small>12 words · {saved ? 'Saved' : 'Unsaved'}</small>}
      </section>
      <output aria-live="polite">{message}</output>
      <Button
        variant="ghost"
        onClick={() => setMessage('You can continue outside the command bar.')}
      >
        Continue editing
      </Button>
    </div>
  )
}
function PlanningBoard({ dir, loop, initialOpen, disabled, pending, ...surface }: Options) {
  const label = useId(),
    [layout, setLayout] = useState<string | null>('columns'),
    [grid, setGrid] = useState(true),
    [rulers, setRulers] = useState(false),
    [destination, setDestination] = useState('Personal space'),
    all = grid && rulers,
    mixed = grid !== rulers
  return (
    <div
      style={{ display: 'grid', gap: '1rem', width: 'min(40rem,calc(100vw - 2rem))' }}
      dir={dir}
    >
      <Menubar
        aria-label="Planning commands"
        loop={loop}
        defaultValue={initialOpen ? 'file' : null}
        style={{ '--rad-menubar-gap': '.5rem' }}
      >
        <MenubarMenu value="file">
          <MenubarTrigger pending={pending}>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarSub>
                <MenubarSubTrigger disabled={disabled}>Move board</MenubarSubTrigger>
                <MenubarPortal>
                  <MenubarSubContent motion={surface.motion}>
                    <MenubarItem onSelect={() => setDestination('Personal space')}>
                      Personal space
                    </MenubarItem>
                    <MenubarSub>
                      <MenubarSubTrigger>Team spaces</MenubarSubTrigger>
                      <MenubarPortal>
                        <MenubarSubContent motion={surface.motion}>
                          <MenubarItem onSelect={() => setDestination('Design team')}>
                            Design team
                          </MenubarItem>
                          <MenubarItem onSelect={() => setDestination('Engineering')}>
                            Engineering
                          </MenubarItem>
                        </MenubarSubContent>
                      </MenubarPortal>
                    </MenubarSub>
                  </MenubarSubContent>
                </MenubarPortal>
              </MenubarSub>
              <MenubarItem onSelect={() => setDestination('CSV export ready')}>
                Export CSV
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger disabled={disabled}>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarGroup aria-labelledby={label}>
                <MenubarLabel id={label}>Canvas guides</MenubarLabel>
                <MenubarCheckboxItem
                  checked={all}
                  indeterminate={mixed}
                  onCheckedChange={next => {
                    setGrid(next)
                    setRulers(next)
                  }}
                  parts={{ indicator: { style: { color: 'var(--rad-color-accent)' } } }}
                >
                  All guides
                </MenubarCheckboxItem>
                <MenubarCheckboxItem
                  checked={grid}
                  onCheckedChange={setGrid}
                >
                  Grid lines
                </MenubarCheckboxItem>
                <MenubarCheckboxItem
                  checked={rulers}
                  onCheckedChange={setRulers}
                >
                  Rulers
                </MenubarCheckboxItem>
              </MenubarGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarRadioGroup
                aria-label="Board layout"
                value={layout}
                onValueChange={setLayout}
              >
                <MenubarRadioItem value="columns">Columns</MenubarRadioItem>
                <MenubarRadioItem value="list">List</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <section
        aria-label="Planning board"
        style={{
          padding: 24,
          minHeight: 160,
          display: layout === 'columns' ? 'grid' : 'block',
          gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
          gap: 16,
          border: rulers
            ? '3px solid var(--rad-color-accent)'
            : '1px solid var(--rad-color-border)',
          backgroundImage: grid
            ? 'linear-gradient(var(--rad-color-border) 1px,transparent 1px),linear-gradient(90deg,var(--rad-color-border) 1px,transparent 1px)'
            : undefined,
          backgroundSize: '24px 24px'
        }}
      >
        <strong>Research</strong>
        <strong>Design</strong>
        <strong>Delivery</strong>
      </section>
      <output aria-live="polite">Board in {destination}.</output>
    </div>
  )
}
function ConsumerButton(props: MenubarRenderProps) {
  return <button {...props}>{props.children}</button>
}
function ReportActions({ dir, loop, initialOpen, disabled, pending, ...surface }: Options) {
  const form = useId(),
    title = useRef<HTMLButtonElement>(null),
    [menu, setMenu] = useState<string | null>(initialOpen ? 'file' : null),
    [keep, setKeep] = useState(false),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [name, setName] = useState('Quarterly review'),
    [metadata, setMetadata] = useState(true),
    [message, setMessage] = useState('No report action requested.')
  return (
    <div
      style={layout}
      dir={dir}
    >
      <form
        id={form}
        onSubmit={event => {
          event.preventDefault()
          const native = event.nativeEvent,
            submitter =
              native instanceof event.currentTarget.ownerDocument.defaultView!.SubmitEvent
                ? native.submitter
                : null,
            data = new FormData(event.currentTarget, submitter)
          setMessage(`${data.get('intent')} requested for ${data.get('report')}.`)
        }}
        onReset={() => {
          setName('Quarterly review')
          setMessage('Report draft reset.')
        }}
      >
        <Field label="Report name">
          <Input
            name="report"
            value={name}
            onChange={event => setName(event.target.value)}
            required
          />
        </Field>
      </form>
      <Checkbox
        label="Keep File menu open"
        checked={keep}
        onChange={event => {
          setKeep(event.target.checked)
          if (event.target.checked) setMenu('file')
        }}
      />
      <Checkbox
        label="Review before export"
        checked={review}
        onChange={event => setReview(event.target.checked)}
      />
      <Checkbox
        label="Export in progress"
        checked={busy}
        onChange={event => setBusy(event.target.checked)}
      />
      <Button
        variant="ghost"
        onClick={() => title.current?.focus()}
      >
        Focus File menu
      </Button>
      <Menubar
        aria-label="Report commands"
        loop={loop}
        value={menu}
        onValueChange={next => {
          if (!keep || next === 'file') setMenu(next)
        }}
      >
        <MenubarMenu value="file">
          <MenubarTrigger
            ref={title}
            pending={pending}
          >
            File
          </MenubarTrigger>
          <MenubarPortal>
            <MenubarContent
              {...surface}
              style={{ '--rad-menu-width': '18rem', ...surface.style }}
            >
              <MenubarItem
                form={form}
                type="submit"
                name="intent"
                value="Export"
                disabled={disabled}
                pending={pending || busy}
                render={props => <ConsumerButton {...props} />}
                onSelect={event => {
                  if (review) {
                    event.preventDefault()
                    setMessage('Review the report before exporting.')
                  }
                }}
              >
                Export report
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                form={form}
                type="reset"
              >
                Discard draft
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger disabled={disabled}>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarItem
                closeOnSelect={false}
                onSelect={() => setMessage('Report preview is ready.')}
              >
                Refresh preview
              </MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="view">
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent {...surface}>
              <MenubarCheckboxItem
                checked={metadata}
                onCheckedChange={setMetadata}
              >
                Report metadata
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
      <article
        style={{ padding: 24, border: '1px solid var(--rad-color-border)', borderRadius: '.75rem' }}
      >
        <h3 style={{ marginTop: 0 }}>{name}</h3>
        {metadata && <p>Prepared by the product team · Internal draft</p>}
      </article>
      <output aria-live="polite">{message}</output>
    </div>
  )
}
