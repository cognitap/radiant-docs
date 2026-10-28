'use client'

import '@cognitap/radiant/styles.css'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Radio,
  RadioGroup,
  ThemeScope,
  radiant,
  useField,
  type RadioProps,
  type ControlSize,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { MotionProvider, useReducedMotion, useSpring } from '@cognitap/radiant/motion/react'

const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

/** Local grouped adapter: selected drives decoration only; RadioGroup still owns native selection. */
export function RadioFeedback({
  selected,
  disabled,
  parts,
  ...props
}: Omit<RadioProps, 'checked' | 'defaultChecked'> & { selected: boolean }) {
  const wrapper = useRef<HTMLSpanElement>(null)
  const field = useField()
  const blocked = disabled || field?.disabled
  const target = selected ? 1 : 0
  const spring = useSpring(target, 'press')
  // Indicator customization takes ownership. Root input styles are always forwarded untouched.
  const custom = Boolean(parts?.indicator?.className || parts?.indicator?.style)
  useEffect(() => {
    const node = wrapper.current
    if (!node || custom) return
    const key = '--example-radio-feedback'
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
      data-radio-feedback=""
      style={{ display: 'inline-flex', minWidth: 0, maxWidth: '100%' }}
    >
      <Radio
        {...props}
        disabled={disabled}
        parts={
          custom
            ? parts
            : {
                ...parts,
                indicator: { style: { scale: 'var(--example-radio-feedback, 1)' } }
              }
        }
      />
    </span>
  )
}

const plans = [
  { value: '', label: 'Personal', detail: 'A quiet place for your next idea.', price: 'Free' },
  {
    value: 'pro',
    label: 'Pro',
    detail: 'More room to make something great.',
    price: '$12 / month'
  },
  {
    value: 'retired',
    label: 'Studio · unavailable',
    detail: 'This plan is no longer offered.',
    price: 'Archived',
    disabled: true
  },
  {
    value: 'team',
    label: 'Team',
    detail: 'Bring your people and build together.',
    price: '$29 / month'
  }
]

export function RadioPlanExample({
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
        <PlanEditor
          controlSize={controlSize}
          off={selected.motion.mode === 'off'}
        />
      </MotionProvider>
    </ThemeScope>
  )
}

function PlanEditor({ controlSize, off }: { controlSize: ControlSize; off: boolean }) {
  const id = useId()
  const first = useRef<HTMLInputElement>(null)
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const reduced = useReducedMotion()
  const [value, setValue] = useState<string | null>('pro')
  const [locked, setLocked] = useState(false)
  const [touched, setTouched] = useState(false)
  const [feedback, setFeedback] = useState('Your next chapter starts here.')
  const error = touched && !locked && value === null ? 'Choose a plan before saving.' : ''
  return (
    <Card style={{ marginTop: '1rem', minWidth: 0 }}>
      <CardHeader>
        <CardDescription>WORKSPACE / YOUR NEXT CHAPTER</CardDescription>
        <CardTitle>Make room for what comes next.</CardTitle>
        <CardDescription>One plan. All the possibility you need.</CardDescription>
      </CardHeader>
      <CardContent style={{ display: 'grid', gap: '1.25rem' }}>
        <Checkbox
          label="Lock plan selection"
          checked={locked}
          onChange={event => setLocked(event.target.checked)}
        />
        <form
          aria-label="Workspace plan"
          noValidate
          style={{ display: 'grid', gap: '1.5rem' }}
          onReset={() => {
            setValue('pro')
            setTouched(false)
            setFeedback('Reset to Pro and monthly billing.')
          }}
          onSubmit={event => {
            event.preventDefault()
            setTouched(true)
            if (!locked && value === null) {
              first.current?.focus()
              setFeedback('Choose a plan before saving.')
              return
            }
            const data = new FormData(event.currentTarget)
            const plan = data.get(`${id}-plan`)
            setFeedback(
              `Saved locally: plan ${plan === null ? 'omitted (locked)' : plan === '' ? 'Personal (empty value)' : plan} · billing ${data.get(`${id}-billing`)}.`
            )
          }}
        >
          <RadioGroup
            label="Choose your plan"
            name={`${id}-plan`}
            value={value}
            required
            disabled={locked}
            controlSize={controlSize}
            description="Use arrow keys to explore. Studio is unavailable."
            error={error}
            onValueChange={next => {
              setValue(next)
              setTouched(true)
            }}
            parts={{ options: { style: { justifyItems: 'stretch' } } }}
          >
            {plans.map((plan, index) => (
              <RadioFeedback
                key={plan.value}
                ref={index === 0 ? first : undefined}
                value={plan.value}
                selected={value === plan.value}
                disabled={plan.disabled}
                label={
                  <span style={{ display: 'grid', gap: '.25rem' }}>
                    <span
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        gap: '.25rem'
                      }}
                    >
                      <strong>{plan.label}</strong>
                      <span id={`${id}-price-${index}`}>{plan.price}</span>
                    </span>
                    <span
                      id={`${id}-detail-${index}`}
                      style={{
                        fontWeight: 400,
                        fontSize: '.875rem',
                        color: 'var(--rad-color-muted-foreground)'
                      }}
                    >
                      {plan.detail}
                    </span>
                  </span>
                }
                aria-label={plan.label}
                aria-describedby={`${id}-detail-${index} ${id}-price-${index}`}
                parts={{
                  wrapper: {
                    style: {
                      display: 'flex',
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '.875rem',
                      border: '1px solid var(--rad-color-border)',
                      borderRadius: 'var(--rad-surface-radius, .5rem)',
                      background:
                        value === plan.value
                          ? 'color-mix(in oklch, var(--rad-color-accent) 8%, transparent)'
                          : 'transparent'
                    }
                  },
                  label: { style: { width: '100%' } }
                }}
              />
            ))}
          </RadioGroup>
          <RadioGroup
            label="Billing cadence"
            name={`${id}-billing`}
            defaultValue="monthly"
            controlSize={controlSize}
            parts={{ options: { style: { display: 'flex', flexWrap: 'wrap', gap: '1rem' } } }}
          >
            <Radio
              value="monthly"
              label="Monthly"
            />
            <Radio
              value="yearly"
              label="Yearly"
            />
          </RadioGroup>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              type="submit"
              disabled={!ready}
              style={{ minWidth: 0, maxWidth: '100%' }}
            >
              Save plan
            </Button>
            <Button
              type="reset"
              variant="outline"
              tone="neutral"
            >
              Reset draft
            </Button>
            <Button
              variant="ghost"
              tone="neutral"
              disabled={locked}
              onClick={() => {
                setValue(null)
                setTouched(false)
                setFeedback('Selection cleared. No plan value is submitted.')
              }}
            >
              Clear choice
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

export function RadioStatePlayground({ controlSize = 'medium' }: { controlSize?: ControlSize }) {
  const id = useId()
  const reduced = useReducedMotion()
  const [value, setValue] = useState<string | null>('pro')
  const [disabled, setDisabled] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [horizontal, setHorizontal] = useState(false)
  return (
    <div style={{ display: 'grid', gap: '1rem', padding: '.5rem', minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Checkbox
          label="Disabled group"
          checked={disabled}
          onChange={event => setDisabled(event.target.checked)}
        />
        <Checkbox
          label="Invalid group"
          checked={invalid}
          onChange={event => setInvalid(event.target.checked)}
        />
        <Checkbox
          label="Horizontal layout"
          checked={horizontal}
          onChange={event => setHorizontal(event.target.checked)}
        />
      </div>
      <RadioGroup
        label="Try arrow keys"
        name={`${id}-trial`}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        error={invalid ? 'Choose the plan that fits your workspace.' : undefined}
        controlSize={controlSize}
        parts={{
          options: {
            style: horizontal ? { display: 'flex', flexWrap: 'wrap', gap: '1rem' } : undefined
          }
        }}
      >
        <RadioFeedback
          label="Personal"
          value=""
          selected={value === ''}
        />
        <RadioFeedback
          label="Pro"
          value="pro"
          selected={value === 'pro'}
        />
        <RadioFeedback
          label="Studio · unavailable"
          value="retired"
          selected={value === 'retired'}
          disabled
        />
        <RadioFeedback
          label="Team"
          value="team"
          selected={value === 'team'}
        />
      </RadioGroup>
      <Button
        variant="outline"
        tone="neutral"
        disabled={disabled}
        onClick={() => setValue(null)}
      >
        Clear trial selection
      </Button>
      <output>
        {value === null ? 'No selection' : value === '' ? 'Personal (empty value)' : value} ·{' '}
        {reduced ? 'reduced by system' : 'system motion'}
      </output>
    </div>
  )
}
