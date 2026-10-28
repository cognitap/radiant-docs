'use client'

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  Input,
  Radio,
  RadioGroup,
  ThemeScope,
  radiant,
  type ControlSize,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import {
  MotionProvider,
  useReducedMotion,
  useSpringLayout,
  useSpringStyle
} from '@cognitap/radiant/motion/react'

import '@cognitap/radiant/styles.css'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
function emailError(input: HTMLInputElement) {
  return input.validity.valid
    ? ''
    : input.validity.valueMissing
      ? 'Enter your work email.'
      : 'Use a valid email address, such as ada@example.com.'
}

export function InputProfileExample({
  theme = radiant,
  mode = 'light',
  controlSize = 'medium'
}: {
  theme?: Theme
  mode?: ThemeMode
  controlSize?: ControlSize
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
      style={{ maxWidth: '42rem', minWidth: 0, overflowX: 'clip', overflowClipMargin: '.5rem' }}
    >
      <MotionProvider>
        <Checkbox
          label="Turn off spatial motion"
          checked={off}
          onChange={event => setOff(event.target.checked)}
        />
        <ProfileEditor
          controlSize={controlSize}
          off={selected.motion.mode === 'off'}
        />
      </MotionProvider>
    </ThemeScope>
  )
}

function ProfileEditor({ controlSize, off }: { controlSize: ControlSize; off: boolean }) {
  const form = useRef<HTMLFormElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const focusDot = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [name, setName] = useState('Ada Lovelace')
  const [editing, setEditing] = useState('')
  const [composing, setComposing] = useState(false)
  const [touched, setTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState('')
  const [emailDisabled, setEmailDisabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('Your changes stay in this preview.')
  useSpringLayout(form)
  // The decorative cue owns its opacity; the input keeps native focus, selection and styles.
  const focus = useSpringStyle(focusDot, 'opacity', 0, 'follow')
  useEffect(() => focus.to(editing ? 1 : 0), [focus, editing])
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )
  const nameInvalid =
    name.trim().length < 2 ? 'Use at least two characters for your display name.' : ''
  return (
    <Card style={{ minWidth: 0, marginTop: '1rem' }}>
      <CardHeader>
        <CardDescription>PROFILE / THE HUMAN DETAILS</CardDescription>
        <CardTitle>A name people remember.</CardTitle>
        <CardDescription>
          Update your public name and the address where your team can reach you.
        </CardDescription>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', minWidth: 0 }}>
          <span
            aria-hidden="true"
            style={{
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: 'var(--rad-color-accent)',
              color: 'var(--rad-color-accent-foreground)'
            }}
          >
            {name.slice(0, 1).toUpperCase() || '?'}
          </span>
          <strong style={{ overflowWrap: 'anywhere', minWidth: 0 }}>
            {name || 'Your public name'}
          </strong>
        </div>
      </CardHeader>
      <CardContent style={{ display: 'grid', gap: '1.25rem' }}>
        <Checkbox
          label="Disable email"
          checked={emailDisabled}
          disabled={saving}
          onChange={event => {
            setEmailDisabled(event.target.checked)
            setEmailInvalid(
              event.target.checked || !emailInput.current ? '' : emailError(emailInput.current)
            )
          }}
        />
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <span
            ref={focusDot}
            data-focus-cue=""
            aria-hidden="true"
            style={{
              opacity: 0,
              width: '.5rem',
              height: '.5rem',
              borderRadius: '50%',
              background: 'var(--rad-color-accent)'
            }}
          />
          <span>{editing ? `Editing ${editing}` : 'Choose a field to begin.'}</span>
        </div>
        <form
          ref={form}
          aria-label="Edit public profile"
          noValidate
          style={{ display: 'grid', gap: '1.5rem', overflowX: 'clip', overflowClipMargin: '.5rem' }}
          onReset={() => {
            setName('Ada Lovelace')
            setTouched(false)
            setEmailTouched(false)
            setComposing(false)
            setEmailInvalid('')
            setFeedback('Draft reset to Ada Lovelace.')
          }}
          onSubmit={event => {
            event.preventDefault()
            if (saving || composing) return
            const invalidEmail = emailInput.current ? emailError(emailInput.current) : ''
            setTouched(true)
            setEmailTouched(true)
            setEmailInvalid(invalidEmail)
            if (nameInvalid || invalidEmail) {
              ;(nameInvalid ? nameInput : emailInput).current?.focus()
              setFeedback('Check the highlighted fields, then save again.')
              return
            }
            const data = new FormData(event.currentTarget)
            setSaving(true)
            setFeedback('Saving your profile…')
            // Replace this local delay with the application's persistence request.
            timer.current = setTimeout(() => {
              timer.current = null
              setSaving(false)
              setFeedback(
                `Saved locally: ${String(data.get('displayName')).trim()} · ${data.get('email') ?? 'email omitted (disabled)'}.`
              )
            }, 700)
          }}
        >
          <div
            data-rad-layout-slot=""
            style={{ display: 'flow-root' }}
          >
            <div data-rad-layout-part="">
              <Field
                label="Display name"
                required
                description={`${name.length}/40 characters. Your public name appears exactly as you type it.`}
                error={touched && !composing ? nameInvalid : undefined}
              >
                <Input
                  ref={nameInput}
                  name="displayName"
                  value={name}
                  maxLength={40}
                  autoComplete="name"
                  controlSize={controlSize}
                  readOnly={saving}
                  onChange={event => setName(event.target.value)}
                  onFocus={() => setEditing('display name')}
                  onBlur={() => {
                    setEditing('')
                    setTouched(true)
                  }}
                  onCompositionStart={() => setComposing(true)}
                  onCompositionEnd={() => setComposing(false)}
                />
              </Field>
            </div>
          </div>
          <div
            data-rad-layout-slot=""
            style={{ display: 'flow-root' }}
          >
            <div data-rad-layout-part="">
              <Field
                label="Work email"
                required
                disabled={emailDisabled}
                description="Browser-owned value. Disabled email is omitted from the saved payload."
                error={emailInvalid}
              >
                <Input
                  ref={emailInput}
                  name="email"
                  type="email"
                  defaultValue="ada@example.com"
                  autoComplete="email"
                  controlSize={controlSize}
                  readOnly={saving}
                  onFocus={() => setEditing('work email')}
                  onChange={event => {
                    if (emailTouched) setEmailInvalid(emailError(event.currentTarget))
                  }}
                  onBlur={event => {
                    setEditing('')
                    setEmailTouched(true)
                    setEmailInvalid(emailError(event.currentTarget))
                  }}
                />
              </Field>
            </div>
          </div>
          <div
            data-rad-layout-slot=""
            style={{ display: 'flow-root' }}
          >
            <div
              data-rad-layout-part=""
              style={{ display: 'grid', gap: '1rem' }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                <Button
                  type="submit"
                  pending={saving}
                  disabled={!ready}
                  style={{ minWidth: 0, maxWidth: '100%' }}
                >
                  Save profile
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  tone="neutral"
                  disabled={saving}
                >
                  Reset draft
                </Button>
              </div>
              <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
              <CardDescription>
                Spatial motion: {reduced ? 'reduced by system' : off ? 'off' : 'on'}. Editing and
                native focus stay immediate.
              </CardDescription>
            </div>
          </div>
        </form>
        <details>
          <summary>Compare shared control sizes</summary>
          <InputSizeComparison />
        </details>
      </CardContent>
    </Card>
  )
}

export function InputSizeComparison() {
  const id = useId()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 12rem), 1fr))',
        gap: '1.5rem',
        paddingTop: '1rem'
      }}
    >
      {(['small', 'medium', 'large'] as const).map(controlSize => (
        <div
          key={controlSize}
          style={{ display: 'grid', gap: '1rem', alignContent: 'start', minWidth: 0 }}
        >
          <Field label={`${controlSize} input`}>
            <Input
              defaultValue="Native input"
              size={24}
              controlSize={controlSize}
            />
          </Field>
          <Checkbox
            label={`${controlSize} updates`}
            controlSize={controlSize}
            defaultChecked
          />
          <RadioGroup
            label={`${controlSize} cadence`}
            name={`${id}-${controlSize}`}
            defaultValue="weekly"
            controlSize={controlSize}
          >
            <Radio
              label="Weekly"
              value="weekly"
            />
            <Radio
              label="Monthly"
              value="monthly"
            />
          </RadioGroup>
        </div>
      ))}
    </div>
  )
}
