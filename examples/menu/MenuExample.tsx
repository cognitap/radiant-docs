'use client'
import { useId, useRef, useState } from 'react'
import {
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuContent,
  MenuItem,
  MenuGroup,
  MenuLabel,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
  Field,
  Input,
  Button,
  Checkbox,
  type MenuContentProps,
  type MenuRenderProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
type Options = Pick<
  MenuContentProps,
  'side' | 'align' | 'sideOffset' | 'collisionPadding' | 'motion' | 'className' | 'style'
> & { initialOpen?: boolean; disabled?: boolean; pending?: boolean; dir?: 'ltr' | 'rtl' }
const layout = {
  display: 'grid',
  gap: '1rem',
  width: 'min(30rem,calc(100vw - 2rem))',
  maxWidth: '100%'
}

import '@cognitap/radiant/styles.css'
export type MenuTask = 'file' | 'canvas' | 'export' | 'form'
export function MenuExample({ task = 'file', ...options }: Options & { task?: MenuTask }) {
  return (
    <MotionProvider>
      {task === 'canvas' ? (
        <CanvasSettings {...options} />
      ) : task === 'export' ? (
        <Exporting {...options} />
      ) : task === 'form' ? (
        <NativeActions {...options} />
      ) : (
        <FileActions {...options} />
      )}
    </MotionProvider>
  )
}
function FileActions({ initialOpen, disabled, pending, dir, ...surface }: Options) {
  const id = useId(),
    [name, setName] = useState('Project brief'),
    [owner, setOwner] = useState(false),
    [message, setMessage] = useState('No file action requested.')
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Field label="File name">
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
        />
      </Field>
      <Checkbox
        label="Owner tools"
        checked={owner}
        onChange={event => setOwner(event.target.checked)}
      />
      <Menu defaultOpen={initialOpen}>
        <MenuTrigger variant="outline">File actions</MenuTrigger>
        <MenuPortal>
          <MenuContent {...surface}>
            <MenuGroup aria-labelledby={id}>
              <MenuLabel id={id}>Current file</MenuLabel>
              <MenuItem
                disabled={disabled}
                onSelect={() => {
                  setName(`${name} v2`)
                  setMessage('File renamed.')
                }}
              >
                Rename
              </MenuItem>
              <MenuItem
                disabled={disabled}
                pending={pending}
                onSelect={() => {
                  setName(`${name} (copy)`)
                  setMessage('Copy created.')
                }}
              >
                Duplicate
              </MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem
              disabled={disabled || !owner}
              onSelect={() => setMessage(`Archived “${name}”.`)}
            >
              Archive · owner only
            </MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
      <output aria-live="polite">{message}</output>
    </div>
  )
}
function CanvasSettings({ initialOpen, disabled, pending, dir, ...surface }: Options) {
  const id = useId(),
    [features, setFeatures] = useState(['grid']),
    [view, setView] = useState<string | null>('list'),
    all = features.length === 2,
    mixed = features.length === 1
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Menu defaultOpen={initialOpen}>
        <MenuTrigger variant="outline">Canvas settings</MenuTrigger>
        <MenuPortal>
          <MenuContent {...surface}>
            <MenuGroup aria-labelledby={id}>
              <MenuLabel id={id}>Canvas guides</MenuLabel>
              <MenuCheckboxItem
                checked={all}
                indeterminate={mixed}
                disabled={disabled}
                onCheckedChange={checked => setFeatures(checked ? ['grid', 'rulers'] : [])}
                parts={{ indicator: { style: { color: 'var(--rad-color-accent)' } } }}
              >
                All guides
              </MenuCheckboxItem>
              {['grid', 'rulers'].map(value => (
                <MenuCheckboxItem
                  key={value}
                  checked={features.includes(value)}
                  disabled={disabled}
                  pending={pending}
                  onCheckedChange={checked =>
                    setFeatures(current =>
                      checked
                        ? [...new Set([...current, value])]
                        : current.filter(item => item !== value)
                    )
                  }
                >
                  {value === 'grid' ? 'Grid lines' : 'Rulers'}
                </MenuCheckboxItem>
              ))}
            </MenuGroup>
            <MenuSeparator />
            <MenuRadioGroup
              aria-label="Record layout"
              defaultValue="list"
              onValueChange={setView}
            >
              <MenuLabel>Record layout</MenuLabel>
              <MenuRadioItem
                value="list"
                disabled={disabled}
              >
                List
              </MenuRadioItem>
              <MenuRadioItem
                value="grid"
                disabled={disabled}
              >
                Grid
              </MenuRadioItem>
            </MenuRadioGroup>
          </MenuContent>
        </MenuPortal>
      </Menu>
      <section
        aria-label="Canvas preview"
        style={{
          padding: '1.5rem',
          border: '1px solid var(--rad-color-border)',
          borderRadius: 'var(--rad-control-radius)',
          backgroundImage: features.includes('grid')
            ? 'linear-gradient(var(--rad-color-border) 1px,transparent 1px),linear-gradient(90deg,var(--rad-color-border) 1px,transparent 1px)'
            : 'none',
          backgroundSize: '24px 24px'
        }}
      >
        {features.includes('rulers') && <p>0 — 100 — 200 — 300</p>}
        <ul
          style={{
            display: view === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
            gap: '1rem'
          }}
        >
          {['Website', 'Mobile app', 'Research', 'Documentation'].map(name => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
function Exporting({ initialOpen, disabled, pending, dir, ...surface }: Options) {
  const [format, setFormat] = useState<string | null>('pdf'),
    [notes, setNotes] = useState(true),
    [result, setResult] = useState('No export prepared.')
  const prepare = (destination: string) =>
    setResult(
      `Prepared ${format?.toUpperCase() ?? 'PDF'} for ${destination}${notes ? ' with notes' : ''}.`
    )
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Menu defaultOpen={initialOpen}>
        <MenuTrigger variant="outline">Export report</MenuTrigger>
        <MenuPortal>
          <MenuContent {...surface}>
            <MenuRadioGroup
              aria-label="Export format"
              value={format}
              onValueChange={setFormat}
            >
              <MenuLabel>Format</MenuLabel>
              <MenuRadioItem
                value="pdf"
                disabled={disabled}
              >
                PDF
              </MenuRadioItem>
              <MenuRadioItem
                value="csv"
                disabled={disabled}
              >
                CSV
              </MenuRadioItem>
            </MenuRadioGroup>
            <MenuCheckboxItem
              defaultChecked
              disabled={disabled}
              onCheckedChange={setNotes}
            >
              Include notes
            </MenuCheckboxItem>
            <MenuSeparator />
            <MenuSub>
              <MenuSubTrigger
                disabled={disabled}
                pending={pending}
                parts={{ indicator: { style: { color: 'var(--rad-color-accent)' } } }}
              >
                Save to
              </MenuSubTrigger>
              <MenuPortal>
                <MenuSubContent motion={surface.motion}>
                  <MenuItem
                    disabled={disabled}
                    onSelect={() => prepare('Downloads')}
                  >
                    Downloads
                  </MenuItem>
                  <MenuSub>
                    <MenuSubTrigger disabled={disabled}>Shared drives</MenuSubTrigger>
                    <MenuPortal>
                      <MenuSubContent motion={surface.motion}>
                        <MenuItem
                          disabled={disabled}
                          onSelect={() => prepare('Design team')}
                        >
                          Design team
                        </MenuItem>
                        <MenuItem
                          disabled={disabled}
                          onSelect={() => prepare('Engineering')}
                        >
                          Engineering
                        </MenuItem>
                      </MenuSubContent>
                    </MenuPortal>
                  </MenuSub>
                </MenuSubContent>
              </MenuPortal>
            </MenuSub>
          </MenuContent>
        </MenuPortal>
      </Menu>
      <output aria-live="polite">{result}</output>
    </div>
  )
}
function ConsumerButton(props: MenuRenderProps) {
  return <button {...props}>{props.children}</button>
}
function NativeActions({ initialOpen, disabled, pending, dir, ...surface }: Options) {
  const id = useId(),
    trigger = useRef<HTMLButtonElement>(null),
    [open, setOpen] = useState(initialOpen ?? false),
    [keep, setKeep] = useState(false),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState('No report action requested.')
  return (
    <div
      style={layout}
      dir={dir}
    >
      <form
        id={id}
        onSubmit={event => {
          event.preventDefault()
          const data = new FormData(
            event.currentTarget,
            (event.nativeEvent as SubmitEvent).submitter
          )
          setResult(`${data.get('intent')} requested for “${data.get('report')}”.`)
        }}
        onReset={() => setResult('Report draft reset.')}
      >
        <Field
          label="Report name"
          required
        >
          <Input
            name="report"
            defaultValue="Quarterly review"
          />
        </Field>
      </form>
      <Checkbox
        label="Keep commands open"
        checked={keep}
        onChange={event => setKeep(event.target.checked)}
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
        onClick={() => trigger.current?.focus()}
      >
        Focus report actions
      </Button>
      <Menu
        open={open}
        onOpenChange={next => {
          if (next || !keep) setOpen(next)
        }}
      >
        <MenuTrigger
          ref={trigger}
          variant="outline"
        >
          Report actions
        </MenuTrigger>
        <MenuPortal>
          <MenuContent
            {...surface}
            style={{ '--rad-menu-width': '18rem', '--rad-menu-padding': '.5rem', ...surface.style }}
          >
            <MenuItem
              type="submit"
              form={id}
              name="intent"
              value="Export"
              disabled={disabled}
              pending={pending || busy}
              render={props => <ConsumerButton {...props} />}
              onSelect={event => {
                if (review) {
                  event.preventDefault()
                  setResult('Review the report before exporting.')
                }
              }}
            >
              Export report
            </MenuItem>
            <MenuItem
              closeOnSelect={false}
              onSelect={() => setResult('Report preview ready. Choose another action.')}
            >
              Show preview
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              type="reset"
              form={id}
            >
              Discard draft
            </MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
      <output aria-live="polite">{result}</output>
    </div>
  )
}
