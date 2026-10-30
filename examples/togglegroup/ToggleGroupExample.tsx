'use client'
import { useRef, useState } from 'react'
import {
  ToggleGroup,
  ToggleGroupItem,
  Button,
  Checkbox,
  Field,
  Textarea,
  type ToggleGroupProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type ToggleGroupTask = 'alignment' | 'format' | 'view' | 'filter'
type Options = Pick<
  ToggleGroupProps,
  'orientation' | 'loop' | 'disabled' | 'controlSize' | 'motion'
>
export function ToggleGroupExample({
  task = 'alignment',
  ...options
}: Options & { task?: ToggleGroupTask }) {
  return (
    <MotionProvider>
      {task === 'format' ? (
        <Formatting {...options} />
      ) : task === 'view' ? (
        <Views {...options} />
      ) : task === 'filter' ? (
        <Filtering {...options} />
      ) : (
        <Alignment {...options} />
      )}
    </MotionProvider>
  )
}
const layout = { display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }
function Alignment(options: Options) {
  const [alignment, setAlignment] = useState<string | null>('left')
  return (
    <div style={layout}>
      <ToggleGroup
        {...options}
        aria-label="Text alignment"
        value={alignment}
        onValueChange={setAlignment}
      >
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
      <p
        style={{
          margin: 0,
          textAlign: alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'left'
        }}
      >
        Choose where this paragraph starts.
      </p>
    </div>
  )
}
function Formatting(options: Options) {
  const [styles, setStyles] = useState(['bold'])
  return (
    <div style={layout}>
      <ToggleGroup
        {...options}
        aria-label="Note formatting"
        type="multiple"
        defaultValue={['bold']}
        onValueChange={setStyles}
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="strike">Strikethrough</ToggleGroupItem>
      </ToggleGroup>
      <Field label="Note">
        <Textarea
          defaultValue="Keep the useful details."
          style={{
            fontWeight: styles.includes('bold') ? 700 : 400,
            fontStyle: styles.includes('italic') ? 'italic' : 'normal',
            textDecoration: styles.includes('strike') ? 'line-through' : 'none'
          }}
        />
      </Field>
    </div>
  )
}
function Views(options: Options) {
  const [view, setView] = useState<string | null>('list')
  return (
    <div style={layout}>
      <ToggleGroup
        {...options}
        aria-label="Record view"
        appearance="segmented"
        defaultValue="list"
        onValueChange={setView}
        parts={{ indicator: { style: { '--rad-toggle-group-indicator-radius': '999px' } } }}
        style={{ '--rad-toggle-group-radius': '999px' }}
      >
        <ToggleGroupItem value="list">List</ToggleGroupItem>
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        <ToggleGroupItem
          value="timeline"
          disabled
        >
          Timeline
        </ToggleGroupItem>
      </ToggleGroup>
      {view ? (
        <ul
          aria-label="Project records"
          style={{
            margin: 0,
            padding: '1rem',
            display: view === 'grid' ? 'grid' : 'block',
            gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
            gap: '1rem'
          }}
        >
          {['Website', 'Mobile app', 'Documentation', 'Research'].map(name => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : (
        <p>Choose a record view.</p>
      )}
    </div>
  )
}
function Filtering(options: Options) {
  const [filter, setFilter] = useState<string | null>('all'),
    [allow, setAllow] = useState(false),
    [request, setRequest] = useState('No filter requested.'),
    [rtl, setRtl] = useState(false),
    ref = useRef<HTMLDivElement>(null)
  return (
    <div style={layout}>
      <ToggleGroup
        {...options}
        ref={ref}
        dir={rtl ? 'rtl' : 'ltr'}
        aria-label="Project filter"
        value={filter}
        onValueChange={next => {
          setRequest(`Requested ${next ?? 'no filter'}.`)
          if (allow) setFilter(next)
        }}
      >
        <ToggleGroupItem value="all">All projects</ToggleGroupItem>
        <ToggleGroupItem value="active">Active</ToggleGroupItem>
        <ToggleGroupItem value="archived">Archived</ToggleGroupItem>
      </ToggleGroup>
      <output aria-live="polite">{request}</output>
      <p style={{ margin: 0 }}>Showing {filter ?? 'unfiltered'} projects.</p>
      <Checkbox
        label="Apply filter requests"
        checked={allow}
        onChange={event => setAllow(event.target.checked)}
      />
      <Checkbox
        label="Right-to-left layout"
        checked={rtl}
        onChange={event => setRtl(event.target.checked)}
      />
      <Button
        variant="ghost"
        onClick={() =>
          ref.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus()
        }
      >
        Focus project filter
      </Button>
    </div>
  )
}
