'use client'

import '@cognitap/radiant/styles.css'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  Input,
  ThemeScope,
  radiant,
  useCollapsible,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { MotionProvider, useReducedMotion } from '@cognitap/radiant/motion/react'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const topics = ['Product updates', 'Release notes', 'Team activity']

export function CollapsibleSettingsExample({
  theme = radiant,
  mode = 'light'
}: {
  theme?: Theme
  mode?: ThemeMode
}) {
  const [off, setOff] = useState(false)
  const selected = useMemo<Theme>(
    () => ({ ...theme, motion: { ...theme.motion, mode: off ? 'off' : theme.motion.mode } }),
    [theme, off]
  )
  return (
    <ThemeScope
      theme={selected}
      mode={mode}
      style={{ maxWidth: '42rem', minWidth: 0, boxSizing: 'border-box', padding: '.5rem' }}
    >
      <MotionProvider>
        <Checkbox
          label="Turn off spatial motion"
          checked={off}
          onChange={event => setOff(event.target.checked)}
        />
        <DeliverySettings off={selected.motion.mode === 'off'} />
      </MotionProvider>
    </ThemeScope>
  )
}

function FinishAdvanced({ focusSummary }: { focusSummary: () => void }) {
  const disclosure = useCollapsible()
  return (
    <Button
      variant="ghost"
      tone="neutral"
      aria-label="Done with advanced options"
      onClick={() => {
        disclosure?.setOpen(false)
        focusSummary()
      }}
    >
      Done
    </Button>
  )
}

function DeliverySettings({ off }: { off: boolean }) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [digest, setDigest] = useState(true)
  const [count, setCount] = useState(1)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('A quieter inbox starts here.')
  const summaryRef = useRef<HTMLElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  return (
    <Card style={{ marginTop: '1rem', minWidth: 0 }}>
      <CardHeader>
        <CardDescription>WORKSPACE / DELIVERY PREFERENCES</CardDescription>
        <CardTitle>Make every update count.</CardTitle>
        <CardDescription>
          Choose what reaches you. Keep the finer details close at hand.
        </CardDescription>
      </CardHeader>
      <CardContent style={{ minWidth: 0 }}>
        <form
          aria-label="Delivery preferences"
          noValidate
          style={{ display: 'grid', gap: '1.25rem', minWidth: 0 }}
          onReset={() => {
            setDigest(true)
            setCount(1)
            setError('')
            setFeedback('Form values reset. Disclosure state is unchanged.')
          }}
          onSubmit={event => {
            event.preventDefault()
            if (!emailRef.current?.validity.valid) {
              setError('Use a valid delivery email.')
              emailRef.current?.focus()
              return
            }
            setError('')
            const data = new FormData(event.currentTarget)
            setFeedback(
              `Saved locally: ${data.get('email')} · ${data.has('digest') ? `digest at ${data.get('digestAt')}` : 'digest off'} · topics ${data.getAll('topics').join(', ')}.`
            )
          }}
        >
          <Field
            label="Delivery email"
            required
            error={error}
            description="A work address you check regularly."
          >
            <Input
              ref={emailRef}
              type="email"
              name="email"
              autoComplete="email"
              defaultValue="ada@example.com"
              onChange={() => setError('')}
            />
          </Field>
          <Collapsible
            open={open}
            onOpenChange={setOpen}
            motion={ready ? 'inherit' : 'off'}
          >
            <CollapsibleTrigger ref={summaryRef}>Advanced delivery options</CollapsibleTrigger>
            <CollapsibleContent>
              <div style={{ display: 'grid', gap: '1rem', minWidth: 0 }}>
                <CardDescription>Your choices stay here when the panel is closed.</CardDescription>
                <Checkbox
                  name="digest"
                  value="daily"
                  label="Include a daily digest"
                  checked={digest}
                  onChange={event => setDigest(event.target.checked)}
                />
                {digest && (
                  <Field
                    label="Digest time"
                    description="Your local time."
                  >
                    <Input
                      type="time"
                      name="digestAt"
                      defaultValue="09:00"
                    />
                  </Field>
                )}
                {topics.slice(0, count).map((topic, index) => (
                  <Field
                    key={topic}
                    label={`Topic ${index + 1}`}
                  >
                    <Input
                      name="topics"
                      defaultValue={topic}
                    />
                  </Field>
                ))}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                  <Button
                    variant="outline"
                    tone="neutral"
                    disabled={count === topics.length}
                    onClick={() => setCount(value => Math.min(topics.length, value + 1))}
                  >
                    Add a topic
                  </Button>
                  <FinishAdvanced focusSummary={() => summaryRef.current?.focus()} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              type="submit"
              disabled={!ready}
            >
              Save preferences
            </Button>
            <Button
              type="reset"
              variant="outline"
              tone="neutral"
            >
              Reset fields
            </Button>
            <Button
              variant="ghost"
              tone="neutral"
              disabled={!ready}
              onClick={() => setOpen(value => !value)}
            >
              {open ? 'Collapse options' : 'Expand options'}
            </Button>
          </div>
          <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
          <CardDescription>
            Spatial motion: {reduced ? 'reduced by system' : off ? 'off' : 'on'}. The panel changes
            size; its contents keep their natural size.
          </CardDescription>
        </form>
      </CardContent>
    </Card>
  )
}

export function CollapsibleHeightExample({
  theme = radiant,
  mode = 'light'
}: {
  theme?: Theme
  mode?: ThemeMode
}) {
  const [off, setOff] = useState(false)
  const selected = useMemo<Theme>(
    () => ({ ...theme, motion: { ...theme.motion, mode: off ? 'off' : theme.motion.mode } }),
    [theme, off]
  )
  return (
    <ThemeScope
      theme={selected}
      mode={mode}
      style={{ maxWidth: '42rem', minWidth: 0, boxSizing: 'border-box', padding: '.5rem' }}
    >
      <MotionProvider>
        <HeightLab
          off={selected.motion.mode === 'off'}
          onOffChange={setOff}
        />
      </MotionProvider>
    </ThemeScope>
  )
}

function HeightLab({ off, onOffChange }: { off: boolean; onOffChange: (value: boolean) => void }) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(true)
  const [localOff, setLocalOff] = useState(false)
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState(1)
  const [draft, setDraft] = useState('A little room to think.')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )
  return (
    <div style={{ display: 'grid', gap: '1rem', minWidth: 0 }}>
      <p style={{ margin: 0 }}>More detail, less detail, or a quick change of mind.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Checkbox
          label="Turn off spatial motion"
          checked={off}
          onChange={event => onOffChange(event.target.checked)}
        />
        <Checkbox
          label="Disable disclosure motion"
          checked={localOff}
          onChange={event => setLocalOff(event.target.checked)}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          variant="outline"
          tone="neutral"
          disabled={!ready}
          onClick={() => setOpen(value => !value)}
        >
          Toggle from outside
        </Button>
        <Button
          variant="outline"
          tone="neutral"
          disabled={!ready}
          onClick={() => {
            if (timer.current !== null) clearTimeout(timer.current)
            setOpen(false)
            timer.current = setTimeout(() => {
              timer.current = null
              setOpen(true)
            }, 80)
          }}
        >
          Quick close and reopen
        </Button>
        <Button
          variant="ghost"
          tone="neutral"
          onClick={() => setCount(value => Math.min(5, value + 1))}
          disabled={count === 5}
        >
          Add detail
        </Button>
        <Button
          variant="ghost"
          tone="neutral"
          onClick={() => setCount(1)}
          disabled={count === 1}
        >
          Trim detail
        </Button>
        <Button
          variant="ghost"
          tone="neutral"
          onClick={() => setVersion(value => value + 1)}
        >
          Replace detail
        </Button>
      </div>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        motion={!ready || localOff ? 'off' : 'inherit'}
      >
        <CollapsibleTrigger>Room for the details</CollapsibleTrigger>
        <CollapsibleContent>
          <div
            key={version}
            style={{ display: 'grid', gap: '1rem', minWidth: 0 }}
          >
            <Field label="A retained thought">
              <Input
                value={draft}
                onChange={event => setDraft(event.target.value)}
              />
            </Field>
            <CardDescription>Detail set {version}</CardDescription>
            {Array.from({ length: count }, (_, index) => (
              <p
                key={index}
                style={{ margin: 0 }}
              >
                Note {index + 1}. Good ideas deserve a little space. Add or trim these notes while
                the panel is moving; the text stays crisp and the height follows.
              </p>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <output>
        {open ? 'Open' : 'Closed'} · {count} {count === 1 ? 'note' : 'notes'} ·{' '}
        {reduced
          ? 'reduced by system'
          : off
            ? 'motion off'
            : localOff
              ? 'disclosure off'
              : 'system motion'}
      </output>
    </div>
  )
}
