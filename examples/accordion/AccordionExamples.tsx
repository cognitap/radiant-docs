'use client'

import '@cognitap/radiant/styles.css'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Input,
  Link,
  ThemeScope,
  useAccordion,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { MotionProvider, useReducedMotion } from '@cognitap/radiant/motion/react'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const stack = { display: 'grid', gap: '1rem', minWidth: 0 } as const
const actions = { display: 'flex', flexWrap: 'wrap', gap: '.5rem' } as const
type Options = { theme?: Theme; mode?: ThemeMode }

export function AccordionGuideExample({ theme = radiant, mode = 'light' }: Options) {
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      style={{
        maxWidth: '44rem',
        minWidth: 0,
        padding: '.5rem',
        '--rad-card-padding': 'clamp(.75rem, 3vw, 1.5rem)',
        '--rad-collapsible-padding': 'clamp(.75rem, 3vw, 1.5rem)'
      }}
    >
      <MotionProvider>
        <GettingStarted />
      </MotionProvider>
    </ThemeScope>
  )
}

function CloseAnswer({ value, focus }: { value: string; focus: () => void }) {
  const accordion = useAccordion()
  return (
    <Button
      variant="ghost"
      tone="neutral"
      onClick={() => {
        accordion?.setItemOpen(value, false)
        focus()
      }}
    >
      Got it
    </Button>
  )
}

function GettingStarted() {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const [tips, setTips] = useState(1)
  const summary = useRef<HTMLElement>(null)
  return (
    <Card style={{ minWidth: 0 }}>
      <CardHeader>
        <CardDescription>THE FIELD GUIDE / GETTING STARTED</CardDescription>
        <CardTitle>Good questions. Clear answers.</CardTitle>
        <CardDescription>A small guide to making a workspace feel like yours.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion defaultValue="start">
          <AccordionItem
            value="start"
            motion={ready ? 'inherit' : 'off'}
          >
            <AccordionTrigger level={3}>01 · Where should I begin?</AccordionTrigger>
            <AccordionContent>
              <div style={stack}>
                <p style={{ margin: 0 }}>
                  Start small: one space, a thoughtful name, and room for your next idea.
                </p>
                <Field
                  label="Workspace name"
                  description="This draft stays here when you fold the answer away."
                >
                  <Input
                    defaultValue="Studio North"
                    name="workspace"
                  />
                </Field>
                <Link href="/docs/getting-started/">Read the setup guide</Link>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="habits"
            motion={ready ? 'inherit' : 'off'}
          >
            <AccordionTrigger
              ref={summary}
              level={3}
            >
              02 · How do I keep it useful?
            </AccordionTrigger>
            <AccordionContent>
              <div style={stack}>
                {[
                  'Give each project a clear next step.',
                  'Leave a short note for your future self.',
                  'Make a little time to archive finished work.'
                ]
                  .slice(0, tips)
                  .map((tip, index) => (
                    <p
                      key={tip}
                      style={{ margin: 0 }}
                    >
                      <strong>Habit {index + 1}.</strong> {tip}
                    </p>
                  ))}
                <div style={actions}>
                  <Button
                    variant="outline"
                    tone="neutral"
                    disabled={tips === 3}
                    onClick={() => setTips(value => value + 1)}
                  >
                    One more tip
                  </Button>
                  <CloseAnswer
                    value="habits"
                    focus={() => summary.current?.focus()}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="share"
            motion={ready ? 'inherit' : 'off'}
          >
            <AccordionTrigger level={3}>03 · Can I bring my team?</AccordionTrigger>
            <AccordionContent>
              <p style={{ margin: 0 }}>
                Yes. Invite a few collaborators, agree on names, and keep decisions close to the
                work. Your own pace still matters.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

export function AccordionSelectionExample({ theme = radiant, mode = 'light' }: Options) {
  const [off, setOff] = useState(false)
  const selected = useMemo<Theme>(
    () => ({ ...theme, motion: { ...theme.motion, mode: off ? 'off' : theme.motion.mode } }),
    [theme, off]
  )
  return (
    <ThemeScope
      theme={selected}
      mode={mode}
      style={{
        maxWidth: '44rem',
        minWidth: 0,
        padding: '.5rem',
        '--rad-card-padding': 'clamp(.75rem, 3vw, 1.5rem)',
        '--rad-collapsible-padding': 'clamp(.75rem, 3vw, 1.5rem)'
      }}
    >
      <MotionProvider>
        <SelectionLab
          off={selected.motion.mode === 'off'}
          onOffChange={setOff}
        />
      </MotionProvider>
    </ThemeScope>
  )
}

function SelectionLab({
  off,
  onOffChange
}: {
  off: boolean
  onOffChange: (value: boolean) => void
}) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [multiple, setMultiple] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [localOff, setLocalOff] = useState(false)
  const [draft, setDraft] = useState('Keep the useful details.')
  return (
    <div style={stack}>
      <p style={{ margin: 0 }}>One open thought, or room for a few.</p>
      <div style={actions}>
        <Checkbox
          label="Allow multiple sections"
          checked={multiple}
          onChange={event => setMultiple(event.target.checked)}
        />
        <Checkbox
          label="Disable selection"
          checked={disabled}
          onChange={event => setDisabled(event.target.checked)}
        />
        <Checkbox
          label="Turn off spatial motion"
          checked={off}
          onChange={event => onOffChange(event.target.checked)}
        />
        <Checkbox
          label="Notes motion off"
          checked={localOff}
          onChange={event => setLocalOff(event.target.checked)}
        />
      </div>
      <SelectionOwner
        key={multiple ? 'multiple' : 'single'}
        multiple={multiple}
        disabled={disabled}
        motion={!ready || localOff ? 'off' : 'inherit'}
        draft={draft}
        onDraftChange={setDraft}
        ready={ready}
      />
      <output>
        {reduced ? 'Reduced by system' : off ? 'Motion off' : 'System motion'} ·{' '}
        {localOff ? 'Notes motion off' : 'Notes inherit motion'}
      </output>
    </div>
  )
}

function SelectionOwner({
  multiple,
  disabled,
  motion,
  draft,
  onDraftChange,
  ready
}: {
  multiple: boolean
  disabled: boolean
  motion: 'inherit' | 'off'
  draft: string
  onDraftChange: (value: string) => void
  ready: boolean
}) {
  const [single, setSingle] = useState<string | null>('notes')
  const [many, setMany] = useState<string[]>(['notes'])
  const [changes, setChanges] = useState(0)
  const [count, setCount] = useState(1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelReplay = () => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
  }
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )
  useEffect(() => {
    if (disabled && timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [disabled])
  const change = () => {
    cancelReplay()
    setChanges(value => value + 1)
  }
  const children = (
    <>
      <AccordionItem
        value="notes"
        motion={motion}
      >
        <AccordionTrigger>Notes</AccordionTrigger>
        <AccordionContent>
          <div style={stack}>
            <Field label="A retained note">
              <Input
                value={draft}
                onChange={event => onDraftChange(event.target.value)}
              />
            </Field>
            {Array.from({ length: count }, (_, index) => (
              <p
                key={index}
                style={{ margin: 0 }}
              >
                Detail {index + 1}. Text keeps its natural size while the section finds its new
                height.
              </p>
            ))}
            <div style={actions}>
              <Button
                variant="ghost"
                tone="neutral"
                disabled={count === 4}
                onClick={() => setCount(value => value + 1)}
              >
                Add detail
              </Button>
              <Button
                variant="ghost"
                tone="neutral"
                disabled={count === 1}
                onClick={() => setCount(1)}
              >
                Trim detail
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="rhythm"
        motion={ready ? 'inherit' : 'off'}
      >
        <AccordionTrigger>Rhythm</AccordionTrigger>
        <AccordionContent>
          <p style={{ margin: 0 }}>
            A little space between decisions. Open, close, change your mind; the height follows your
            selection.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="archive"
        disabled
        motion={ready ? 'inherit' : 'off'}
      >
        <AccordionTrigger>Archive · unavailable</AccordionTrigger>
        <AccordionContent>This item stays outside user selection.</AccordionContent>
      </AccordionItem>
    </>
  )
  return (
    <div style={stack}>
      <Button
        variant="outline"
        tone="neutral"
        disabled={disabled || !ready}
        onClick={() => {
          cancelReplay()
          if (multiple) setMany(['rhythm'])
          else setSingle('rhythm')
          timer.current = setTimeout(() => {
            timer.current = null
            if (multiple) setMany(['notes', 'rhythm'])
            else setSingle('notes')
          }, 80)
        }}
      >
        Quick switch
      </Button>
      {multiple ? (
        <Accordion
          type="multiple"
          value={many}
          onValueChange={value => {
            change()
            setMany(value)
          }}
          disabled={disabled}
        >
          {children}
        </Accordion>
      ) : (
        <Accordion
          type="single"
          value={single}
          onValueChange={value => {
            change()
            setSingle(value)
          }}
          disabled={disabled}
        >
          {children}
        </Accordion>
      )}
      <div style={actions}>
        {multiple && (
          <Button
            variant="outline"
            tone="neutral"
            disabled={disabled}
            onClick={() => {
              cancelReplay()
              setMany(['notes', 'rhythm'])
            }}
          >
            Open both
          </Button>
        )}
        <Button
          variant="outline"
          tone="neutral"
          disabled={disabled}
          onClick={() => {
            cancelReplay()
            setSingle(null)
            setMany([])
          }}
        >
          Close all
        </Button>
      </div>
      <output>
        Open: {multiple ? many.join(', ') || 'none' : (single ?? 'none')} · {changes} selection
        requests · {count} {count === 1 ? 'detail' : 'details'}
      </output>
    </div>
  )
}
