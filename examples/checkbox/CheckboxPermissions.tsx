'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore, useMemo } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  ThemeScope,
  useField,
  type CheckboxProps,
  type ControlSize,
  type Theme
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import { MotionProvider, useReducedMotion, useSpring } from '@cognitap/radiant/motion/react'

import '@cognitap/radiant/styles.css'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

/** Local controlled adapter: the input stays native; only its decorative indicator springs. */
export function CheckboxFeedback({
  checked,
  indeterminate = false,
  disabled,
  parts,
  ...props
}: Omit<CheckboxProps, 'defaultChecked'> & { checked: boolean }) {
  const wrapper = useRef<HTMLSpanElement>(null)
  const field = useField()
  const blocked = disabled || field?.disabled
  const target = checked || indeterminate ? 1 : 0
  const spring = useSpring(target, 'press')
  // Indicator customization takes ownership. Root input styles are always forwarded untouched.
  const custom = Boolean(parts?.indicator?.className || parts?.indicator?.style)
  useEffect(() => {
    const node = wrapper.current
    if (!node || custom) return
    const key = '--example-checkbox-feedback'
    const previous = node.style.getPropertyValue(key)
    let written = ''
    const write = (value: number) => {
      written = String(Math.max(0, Math.min(1.15, value)))
      node.style.setProperty(key, written)
    }
    write(spring.get())
    const unsubscribe = spring.subscribe(write)
    return () => {
      unsubscribe()
      if (node.style.getPropertyValue(key) !== written) return
      if (previous) node.style.setProperty(key, previous)
      else node.style.removeProperty(key)
    }
  }, [spring, custom])
  useEffect(() => {
    if (blocked || custom) spring.jump(target)
    else spring.to(target)
  }, [spring, target, blocked, custom])
  return (
    <span
      ref={wrapper}
      data-checkbox-feedback=""
      style={{ display: 'inline-flex', minWidth: 0 }}
    >
      <Checkbox
        {...props}
        checked={checked}
        indeterminate={indeterminate}
        disabled={disabled}
        parts={
          custom
            ? parts
            : {
                ...parts,
                indicator: { style: { scale: 'calc(.65 * var(--example-checkbox-feedback, 1))' } }
              }
        }
      />
    </span>
  )
}

const permissions = [
  {
    value: 'invite',
    label: 'Invite collaborators',
    description: 'Bring the right people into the workspace.'
  },
  {
    value: 'publish',
    label: 'Publish projects',
    description: 'Share finished work with your audience.'
  },
  {
    value: 'export',
    label: 'Export workspace data',
    description: 'Download a copy for your own records.'
  }
]

export function CheckboxPermissionsExample({
  controlSize = 'medium',
  theme = radiant
}: {
  controlSize?: ControlSize
  theme?: Theme
}) {
  const [off, setOff] = useState(false)
  const selected = useMemo<Theme>(
    () => ({ ...theme, motion: { ...theme.motion, mode: off ? 'off' : theme.motion.mode } }),
    [theme, off]
  )
  return (
    <ThemeScope
      theme={selected}
      style={{
        maxWidth: '42rem',
        minWidth: 0,
        boxSizing: 'border-box',
        padding: '.5rem',
        overflowX: 'clip'
      }}
    >
      <MotionProvider>
        <Checkbox
          label="Turn off spatial motion"
          checked={off}
          onChange={event => setOff(event.target.checked)}
        />
        <PermissionsEditor
          controlSize={controlSize}
          off={selected.motion.mode === 'off'}
        />
      </MotionProvider>
    </ThemeScope>
  )
}

function PermissionsEditor({ controlSize, off }: { controlSize: ControlSize; off: boolean }) {
  const id = useId()
  const first = useRef<HTMLInputElement>(null)
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [selected, setSelected] = useState(['invite'])
  const [locked, setLocked] = useState(false)
  const [touched, setTouched] = useState(false)
  const [feedback, setFeedback] = useState('Choose what your collaborators can do.')
  const all = selected.length === permissions.length
  const mixed = selected.length > 0 && !all
  const error = touched && !locked && selected.length === 0 ? 'Choose at least one permission.' : ''
  return (
    <Card style={{ marginTop: '1rem', minWidth: 0 }}>
      <CardHeader>
        <CardDescription>WORKSPACE / COLLABORATOR ACCESS</CardDescription>
        <CardTitle>Give your team room to work.</CardTitle>
        <CardDescription>
          A clear set of permissions, with the important decisions in your hands.
        </CardDescription>
      </CardHeader>
      <CardContent style={{ display: 'grid', gap: '1.25rem' }}>
        <Checkbox
          label="Lock permissions"
          checked={locked}
          onChange={event => setLocked(event.target.checked)}
        />
        <form
          aria-label="Collaborator permissions"
          noValidate
          style={{ display: 'grid', gap: '1.5rem' }}
          onReset={() => {
            setSelected(['invite'])
            setTouched(false)
            setFeedback('Reset to invite-only access.')
          }}
          onSubmit={event => {
            event.preventDefault()
            setTouched(true)
            if (!locked && selected.length === 0) {
              first.current?.focus()
              setFeedback('Choose access before saving.')
              return
            }
            const data = new FormData(event.currentTarget)
            setFeedback(
              `Saved locally: ${data.getAll('permissions').join(', ') || 'permissions omitted (locked)'} · summary ${data.has('summary') ? 'on' : 'off'}.`
            )
          }}
        >
          <Field
            layout="group"
            label="Team permissions"
            required
            disabled={locked}
            description="Select all includes the three editable permissions. Audit access is managed by the owner."
            error={error}
          >
            <CheckboxFeedback
              label="Select all editable permissions"
              checked={all}
              indeterminate={mixed}
              controlSize={controlSize}
              onChange={event => {
                setSelected(event.target.checked ? permissions.map(item => item.value) : [])
                setTouched(true)
              }}
            />
            {permissions.map((item, index) => (
              <div
                key={item.value}
                style={{ display: 'grid', gap: '.25rem', paddingBlock: '.5rem', minWidth: 0 }}
              >
                <CheckboxFeedback
                  ref={index === 0 ? first : undefined}
                  label={item.label}
                  name="permissions"
                  value={item.value}
                  checked={selected.includes(item.value)}
                  controlSize={controlSize}
                  aria-describedby={`${id}-${item.value}`}
                  onChange={event => {
                    setSelected(values =>
                      event.target.checked
                        ? [...values, item.value]
                        : values.filter(value => value !== item.value)
                    )
                    setTouched(true)
                  }}
                />
                <CardDescription id={`${id}-${item.value}`}>{item.description}</CardDescription>
              </div>
            ))}
            <CheckboxFeedback
              label="View audit log · owner managed"
              name="permissions"
              value="audit"
              checked
              disabled
              controlSize={controlSize}
            />
          </Field>
          <Checkbox
            label="Email me an access summary"
            name="summary"
            value="email"
            defaultChecked
            controlSize={controlSize}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              type="submit"
              disabled={!ready}
              style={{ minWidth: 0, maxWidth: '100%' }}
            >
              Save permissions
            </Button>
            <Button
              type="reset"
              variant="outline"
              tone="neutral"
            >
              Reset draft
            </Button>
          </div>
          <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
        </form>
        <CardDescription>
          Spatial motion: {reduced ? 'reduced by system' : off ? 'off' : 'on'}. Selection, keyboard
          and form values update immediately.
        </CardDescription>
      </CardContent>
    </Card>
  )
}
