'use client'
import { useRef, useState, type KeyboardEvent } from 'react'
import {
  Button,
  Field,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  Kbd,
  KbdGroup,
  type InputGroupProps
} from '@cognitap/radiant'
export type InputAddonOptions = Pick<
  InputGroupProps,
  'controlSize' | 'dir' | 'className' | 'style'
> & { disabled?: boolean; readOnly?: boolean; invalid?: boolean; modifier?: 'Control' | 'Command' }
export function FindProjectWithAddons({
  disabled,
  readOnly,
  invalid,
  modifier = 'Control',
  ...group
}: InputAddonOptions) {
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
