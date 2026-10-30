'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Radio,
  RadioGroup,
  useField,
  type ControlSize,
  type RadioProps
} from '@cognitap/radiant'
import { MotionProvider, useSpring } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type RadioTask = 'plan' | 'delivery' | 'filter' | 'survey'
type Presentation = { controlSize?: ControlSize }
export function RadioExample({ task = 'plan', ...props }: Presentation & { task?: RadioTask }) {
  return (
    <MotionProvider>
      {task === 'delivery' ? (
        <Delivery {...props} />
      ) : task === 'filter' ? (
        <Filter {...props} />
      ) : task === 'survey' ? (
        <Survey {...props} />
      ) : (
        <Plan {...props} />
      )}
    </MotionProvider>
  )
}

/** Springs the dot when `selected` changes. RadioGroup still owns the selection. */
function RadioFeedback({
  selected,
  disabled,
  parts,
  ...props
}: Omit<RadioProps, 'checked' | 'defaultChecked'> & { selected: boolean }) {
  const wrapper = useRef<HTMLSpanElement>(null),
    field = useField(),
    blocked = disabled || field?.disabled,
    target = selected ? 1 : 0,
    spring = useSpring(target, 'press')
  useEffect(() => {
    const node = wrapper.current
    if (!node) return
    const write = (value: number) =>
      node.style.setProperty('--example-radio-dot', String(Math.min(1.15, Math.max(0, value))))
    write(spring.get())
    return spring.subscribe(write)
  }, [spring])
  useEffect(() => {
    if (blocked) spring.jump(target)
    else spring.to(target)
  }, [spring, target, blocked])
  return (
    <span
      ref={wrapper}
      style={{ display: 'flex', minWidth: 0 }}
    >
      <Radio
        {...props}
        disabled={disabled}
        parts={{ ...parts, indicator: { style: { scale: 'var(--example-radio-dot, 1)' } } }}
      />
    </span>
  )
}

const plans = [
  { value: '', label: 'Personal', price: 'Free' },
  { value: 'pro', label: 'Pro', price: '$12 / month' },
  { value: 'studio', label: 'Studio', price: 'Unavailable', disabled: true },
  { value: 'team', label: 'Team', price: '$29 / month' }
]
function Plan({ controlSize }: Presentation) {
  const [plan, setPlan] = useState<string | null>('pro')
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}>
      <RadioGroup
        label="Workspace plan"
        name="plan"
        value={plan}
        onValueChange={setPlan}
        controlSize={controlSize}
        parts={{ options: { style: { justifyItems: 'stretch' } } }}
      >
        {plans.map(option => (
          <RadioFeedback
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            selected={plan === option.value}
            label={
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <strong>{option.label}</strong>
                <span>{option.price}</span>
              </span>
            }
            parts={{
              wrapper: {
                style: {
                  width: '100%',
                  padding: '.75rem',
                  border: '1px solid var(--rad-color-border)',
                  borderRadius: '.5rem'
                }
              },
              label: { style: { flex: 1 } }
            }}
          />
        ))}
      </RadioGroup>
      <output>{plan === null ? 'No plan selected' : `Selected: ${plan || 'personal'}`}</output>
    </div>
  )
}

function Delivery({ controlSize }: Presentation) {
  const [message, setMessage] = useState('Standard delivery is selected.')
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}
      onReset={() => setMessage('Reset to standard delivery.')}
      onSubmit={event => {
        event.preventDefault()
        setMessage(`Submitted delivery=${new FormData(event.currentTarget).get('delivery')}.`)
      }}
    >
      <RadioGroup
        label="Delivery speed"
        name="delivery"
        defaultValue="standard"
        controlSize={controlSize}
      >
        <Radio
          value="standard"
          label="Standard, 3–5 days"
        />
        <Radio
          value="express"
          label="Express, next day"
        />
        <Radio
          value="pickup"
          label="Pick up in store"
        />
      </RadioGroup>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <Button type="submit">Place order</Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
        >
          Reset
        </Button>
      </div>
      <output>{message}</output>
    </form>
  )
}

function Filter({ controlSize }: Presentation) {
  const [status, setStatus] = useState<string | null>(null)
  const tasks = [
    { title: 'Draft interview guide', status: 'open' },
    { title: 'Book study room', status: 'done' },
    { title: 'Recruit participants', status: 'open' }
  ].filter(item => status === null || item.status === status)
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}>
      <RadioGroup
        label="Show tasks"
        value={status}
        onValueChange={setStatus}
        controlSize={controlSize}
        parts={{ options: { style: { display: 'flex', flexWrap: 'wrap', gap: '1rem' } } }}
      >
        <Radio
          value="open"
          label="Open"
        />
        <Radio
          value="done"
          label="Done"
        />
      </RadioGroup>
      <Button
        variant="outline"
        tone="neutral"
        disabled={status === null}
        onClick={() => setStatus(null)}
      >
        Show all
      </Button>
      <ul>
        {tasks.map(item => (
          <li key={item.title}>{item.title}</li>
        ))}
      </ul>
    </div>
  )
}

function Survey({ controlSize }: Presentation) {
  const [answer, setAnswer] = useState<string | null>(null),
    [error, setError] = useState(''),
    [message, setMessage] = useState('')
  return (
    <form
      noValidate
      style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}
      onSubmit={event => {
        event.preventDefault()
        if (answer === null) {
          setError('Choose how often you use the app.')
          setMessage('')
          return
        }
        setError('')
        setMessage('Thanks for your answer.')
      }}
    >
      <RadioGroup
        label="How often do you use the app?"
        description="Weekly digests are paused this month."
        required
        error={error}
        value={answer}
        onValueChange={next => {
          setAnswer(next)
          setError('')
        }}
        controlSize={controlSize}
      >
        <Radio
          value="daily"
          label="Daily"
        />
        <Radio
          value="weekly"
          label="Weekly"
          disabled
        />
        <Radio
          value="rarely"
          label="Rarely"
        />
      </RadioGroup>
      <Button
        type="submit"
        style={{ justifySelf: 'start' }}
      >
        Send answer
      </Button>
      <output>{message}</output>
    </form>
  )
}
