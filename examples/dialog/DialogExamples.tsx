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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  ThemeScope,
  radiant,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { MotionProvider, useReducedMotion } from '@cognitap/radiant/motion/react'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false
const initialProfile = { name: 'Ada Lovelace', email: 'ada@example.com' }

export function DialogProfileExample({
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
      style={{ maxWidth: '40rem', minWidth: 0, padding: '.5rem', boxSizing: 'border-box' }}
    >
      <MotionProvider>
        <Checkbox
          label="Turn off spatial motion"
          checked={off}
          onChange={event => setOff(event.target.checked)}
        />
        <ProfileEditor off={selected.motion.mode === 'off'} />
      </MotionProvider>
    </ThemeScope>
  )
}

function ProfileEditor({ off }: { off: boolean }) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [saved, setSaved] = useState(initialProfile)
  const [draft, setDraft] = useState(initialProfile)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState({ name: '', email: '' })
  const [feedback, setFeedback] = useState('Your profile is up to date.')
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )
  return (
    <Card style={{ marginTop: '1rem', minWidth: 0 }}>
      <CardHeader>
        <CardDescription>WORKSPACE / YOUR PROFILE</CardDescription>
        <CardTitle>A familiar face. A fresh start.</CardTitle>
        <CardDescription>Keep your details ready for the people you work with.</CardDescription>
      </CardHeader>
      <CardContent
        style={{ display: 'grid', justifyItems: 'start', gap: '1rem', overflowWrap: 'anywhere' }}
      >
        <div>
          <strong>{saved.name}</strong>
          <p style={{ marginBlock: '.25rem' }}>{saved.email}</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={next => {
            if (pending) return
            if (next) {
              setDraft(saved)
              setErrors({ name: '', email: '' })
            }
            setOpen(next)
          }}
          closeOnEscape={!pending}
          closeOnBackdrop={!pending}
        >
          <DialogTrigger
            disabled={!ready}
            render={props => (
              <button
                {...props}
                data-profile-trigger=""
              />
            )}
          >
            Edit your details
          </DialogTrigger>
          <DialogContent style={{ '--rad-dialog-width': '30rem' }}>
            <DialogTitle>A little more you.</DialogTitle>
            <DialogDescription>
              Update your public name and work email. Changes are saved locally in this example.
            </DialogDescription>
            <form
              aria-label="Profile details"
              noValidate
              style={{ display: 'grid', gap: '1rem', minWidth: 0 }}
              onReset={() => {
                setDraft(saved)
                setErrors({ name: '', email: '' })
              }}
              onSubmit={event => {
                event.preventDefault()
                if (pending) return
                const nextErrors = {
                  name:
                    draft.name.trim().length < 2
                      ? 'Use at least two characters for your name.'
                      : '',
                  email: !emailRef.current?.validity.valid ? 'Enter a valid work email.' : ''
                }
                setErrors(nextErrors)
                if (nextErrors.name || nextErrors.email) {
                  ;(nextErrors.name ? nameRef : emailRef).current?.focus()
                  return
                }
                setPending(true)
                timer.current = setTimeout(() => {
                  timer.current = null
                  setSaved({ ...draft, name: draft.name.trim() })
                  setFeedback(`Saved locally: ${draft.name.trim()} · ${draft.email}.`)
                  setPending(false)
                  setOpen(false)
                }, 650)
              }}
            >
              <fieldset
                disabled={pending}
                style={{
                  display: 'grid',
                  gap: '1rem',
                  border: 0,
                  padding: 0,
                  margin: 0,
                  minWidth: 0
                }}
              >
                <legend style={{ padding: 0, marginBottom: '.75rem', fontWeight: 600 }}>
                  Public details
                </legend>
                <Field
                  label="Display name"
                  required
                  error={errors.name}
                  description="The name your teammates see."
                >
                  <Input
                    ref={nameRef}
                    name="name"
                    autoComplete="name"
                    value={draft.name}
                    onChange={event => {
                      setDraft(current => ({ ...current, name: event.target.value }))
                      setErrors(current => ({ ...current, name: '' }))
                    }}
                  />
                </Field>
                <Field
                  label="Work email"
                  required
                  error={errors.email}
                >
                  <Input
                    ref={emailRef}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={draft.email}
                    onChange={event => {
                      setDraft(current => ({ ...current, email: event.target.value }))
                      setErrors(current => ({ ...current, email: '' }))
                    }}
                  />
                </Field>
              </fieldset>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                <Button
                  type="submit"
                  pending={pending}
                  disabled={!ready}
                >
                  Save profile
                </Button>
                <Button
                  type="reset"
                  variant="ghost"
                  tone="neutral"
                  disabled={pending}
                >
                  Reset fields
                </Button>
                <DialogClose
                  variant="outline"
                  tone="neutral"
                  disabled={pending}
                >
                  Cancel editing
                </DialogClose>
              </div>
              <output>
                {pending ? 'Saving locally…' : 'Cancel keeps your saved profile unchanged.'}
              </output>
            </form>
          </DialogContent>
        </Dialog>
        <output>{feedback}</output>
        <CardDescription>
          Spatial motion: {reduced ? 'reduced by system' : off ? 'off' : 'on'}. Focus and dismissal
          stay native.
        </CardDescription>
      </CardContent>
    </Card>
  )
}

export function DialogTransitionExample({
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
      style={{ maxWidth: '40rem', minWidth: 0, padding: '.5rem', boxSizing: 'border-box' }}
    >
      <MotionProvider>
        <TransitionLab
          off={off}
          onOffChange={setOff}
        />
      </MotionProvider>
    </ThemeScope>
  )
}

function TransitionLab({
  off,
  onOffChange
}: {
  off: boolean
  onOffChange: (value: boolean) => void
}) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [large, setLarge] = useState(false)
  const [contentOff, setContentOff] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )
  return (
    <div style={{ display: 'grid', justifyItems: 'start', gap: '1rem', minWidth: 0 }}>
      <p style={{ margin: 0 }}>A quick return, a longer read, or a quieter entrance.</p>
      <Checkbox
        label="Turn off spatial motion"
        checked={off}
        onChange={event => onOffChange(event.target.checked)}
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogTrigger disabled={!ready}>Open transition lab</DialogTrigger>
        <DialogContent
          motion={contentOff ? 'off' : 'inherit'}
          style={{ '--rad-dialog-width': large ? '38rem' : '26rem' }}
        >
          <DialogTitle>Room to explore.</DialogTitle>
          <DialogDescription>
            Try a quick return or a longer read. Escape and Close return focus immediately.
          </DialogDescription>
          <Checkbox
            label="More detail"
            checked={large}
            onChange={event => setLarge(event.target.checked)}
          />
          <Checkbox
            label="Pause spatial motion"
            checked={off}
            onChange={event => onOffChange(event.target.checked)}
          />
          <Checkbox
            label="Disable content motion"
            checked={contentOff}
            onChange={event => setContentOff(event.target.checked)}
          />
          {large && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {Array.from({ length: 8 }, (_, index) => (
                <p
                  key={index}
                  style={{ margin: 0 }}
                >
                  Chapter {index + 1}. Take a moment to explore the details. The panel keeps a
                  little space around the viewport, and longer content scrolls naturally.
                </p>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => {
                if (timer.current !== null) clearTimeout(timer.current)
                setOpen(false)
                timer.current = setTimeout(() => {
                  timer.current = null
                  setOpen(true)
                }, 80)
              }}
            >
              Close and reopen
            </Button>
            <DialogClose>Close lab</DialogClose>
          </div>
          <form method="dialog">
            <Button
              type="submit"
              variant="ghost"
              tone="neutral"
            >
              Finish natively
            </Button>
          </form>
          <output>
            Spatial motion:{' '}
            {reduced ? 'reduced by system' : off ? 'off' : contentOff ? 'content off' : 'on'}.
          </output>
        </DialogContent>
      </Dialog>
      <output>{open ? 'The lab is open.' : 'The lab is closed.'}</output>
    </div>
  )
}
