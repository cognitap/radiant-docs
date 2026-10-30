'use client'
import { useRef, useState, type KeyboardEvent } from 'react'
import {
  Button,
  Field,
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupAddon,
  Kbd,
  KbdGroup,
  type InputGroupProps
} from '@cognitap/radiant'
export type InputGroupTaskOptions = Pick<
  InputGroupProps,
  'controlSize' | 'dir' | 'className' | 'style'
> & { disabled?: boolean; readOnly?: boolean; invalid?: boolean; modifier?: 'Control' | 'Command' }
export function FindProjectWithAddons({
  disabled,
  readOnly,
  invalid,
  modifier = 'Control',
  ...group
}: InputGroupTaskOptions) {
  const ref = useRef<HTMLInputElement>(null),
    [query, setQuery] = useState('')
  const focus = () => {
    ref.current?.focus()
    ref.current?.select()
  }
  const shortcut = (event: KeyboardEvent) => {
    if (
      event.key.toLowerCase() === 'k' &&
      !event.altKey &&
      !event.shiftKey &&
      (modifier === 'Command' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey)
    ) {
      event.preventDefault()
      focus()
    }
  }
  return (
    <section
      aria-label="Project finder"
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
    >
      <Button
        disabled={disabled}
        onClick={focus}
        onKeyDown={shortcut}
      >
        Find project
      </Button>
      <Field
        label="Project search"
        description="Focus this example, then use the displayed shortcut to select the search text."
        disabled={disabled}
        error={invalid ? 'Use a project name.' : undefined}
      >
        <InputGroup {...group}>
          <InputGroupAddon aria-hidden>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="10"
                cy="10"
                r="6"
              />
              <path d="m15 15 5 5" />
            </svg>
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            ref={ref}
            readOnly={readOnly}
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={shortcut}
            aria-keyshortcuts={`${modifier === 'Command' ? 'Meta' : 'Control'}+K`}
          />
          <InputGroupAddon aria-hidden>
            <KbdGroup>
              <Kbd>{modifier}</Kbd>+<Kbd>K</Kbd>
            </KbdGroup>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <ul>
        {['Reader study', 'Component kit', 'Release checklist']
          .filter(project => project.toLowerCase().includes(query.toLowerCase()))
          .map(project => (
            <li key={project}>{project}</li>
          ))}
      </ul>
    </section>
  )
}
export function SetProjectBudget({
  disabled,
  readOnly,
  invalid,
  modifier: _modifier,
  ...group
}: InputGroupTaskOptions) {
  const [message, setMessage] = useState('Save a budget for the project.')
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(`Budget saved: ${new FormData(event.currentTarget).get('budget')} USD.`)
      }}
      onReset={() => setMessage('Budget restored.')}
    >
      <Field
        label="Project budget"
        required
        disabled={disabled}
        error={invalid ? 'Enter the approved budget.' : undefined}
        description="Enter dollars and cents, using a decimal point."
      >
        <InputGroup {...group}>
          <InputGroupAddon aria-hidden>$</InputGroupAddon>
          <InputGroupInput
            name="budget"
            inputMode="decimal"
            pattern="[0-9]+([.][0-9]{1,2})?"
            defaultValue="250"
            readOnly={readOnly}
          />
          <InputGroupAddon aria-hidden>USD</InputGroupAddon>
        </InputGroup>
      </Field>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <Button
          type="submit"
          disabled={disabled}
        >
          Save budget
        </Button>
        <Button
          type="reset"
          variant="outline"
          disabled={disabled}
        >
          Restore budget
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
const initial = 'Reviewed the interview notes.'
export function PostStudyUpdate({
  disabled,
  readOnly,
  invalid,
  modifier: _modifier,
  ...group
}: InputGroupTaskOptions) {
  const [length, setLength] = useState(initial.length),
    [message, setMessage] = useState('Write an update for the study.')
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(`Posted: ${new FormData(event.currentTarget).get('update')}`)
      }}
      onReset={() => {
        setLength(initial.length)
        setMessage('Update restored.')
      }}
    >
      <Field
        label="Study update"
        description="Up to 240 characters."
        required
        disabled={disabled}
        error={invalid ? 'Review the update before posting.' : undefined}
      >
        <InputGroup {...group}>
          <InputGroupTextarea
            name="update"
            defaultValue={initial}
            maxLength={240}
            readOnly={readOnly}
            onChange={event => setLength(event.target.value.length)}
          />
          <InputGroupAddon className="flex-col items-end self-end py-2">
            <span aria-hidden>{length}/240</span>
            <Button
              type="submit"
              controlSize="small"
              disabled={disabled || readOnly}
            >
              Post update
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Button
        type="reset"
        variant="outline"
        disabled={disabled}
      >
        Restore update
      </Button>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type InputGroupTask = 'find' | 'budget' | 'update'
export function InputGroupExample({
  task = 'find',
  ...options
}: InputGroupTaskOptions & { task?: InputGroupTask }) {
  return (
    <MotionProvider>
      {task === 'budget' ? (
        <SetProjectBudget {...options} />
      ) : task === 'update' ? (
        <PostStudyUpdate {...options} />
      ) : (
        <FindProjectWithAddons {...options} />
      )}
    </MotionProvider>
  )
}
