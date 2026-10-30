'use client'
import { useRef, useState, type KeyboardEvent } from 'react'
import {
  Button,
  Field,
  Input,
  Textarea,
  Kbd,
  KbdGroup,
  Menu,
  MenuTrigger,
  MenuPortal,
  MenuContent,
  MenuItem,
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  type KbdProps
} from '@cognitap/radiant'
export type KbdTaskOptions = Pick<KbdProps, 'className' | 'style'> & {
  modifier?: 'Control' | 'Command'
}
function matches(event: KeyboardEvent, modifier: 'Control' | 'Command', letter: string) {
  return (
    (modifier === 'Command' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === letter
  )
}
function Chord({
  modifier = 'Control',
  letter,
  hidden,
  ...props
}: KbdTaskOptions & { letter: string; hidden?: boolean }) {
  return (
    <KbdGroup
      {...props}
      aria-hidden={hidden || undefined}
    >
      <Kbd {...props}>{modifier}</Kbd>
      <span>+</span>
      <Kbd {...props}>{letter.toUpperCase()}</Kbd>
    </KbdGroup>
  )
}
export function FindProjectWithShortcut({ modifier = 'Control', ...caps }: KbdTaskOptions) {
  const ref = useRef<HTMLInputElement>(null),
    [query, setQuery] = useState('')
  const projects = ['Reader study', 'Component kit', 'Release checklist']
  const onShortcut = (event: KeyboardEvent) => {
    if (matches(event, modifier, 'k')) {
      event.preventDefault()
      ref.current?.focus()
    }
  }
  return (
    <section
      aria-label="Project finder"
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
    >
      <Button
        onKeyDown={onShortcut}
        aria-keyshortcuts={`${modifier === 'Command' ? 'Meta' : 'Control'}+K`}
        onClick={() => ref.current?.focus()}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          Find project
          <Chord
            {...caps}
            modifier={modifier}
            letter="k"
            hidden
          />
        </span>
      </Button>
      <Field
        label="Project search"
        description="Focus this example, then use the displayed shortcut."
      >
        <Input
          onKeyDown={onShortcut}
          ref={ref}
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </Field>
      <ul>
        {projects
          .filter(project => project.toLowerCase().includes(query.toLowerCase()))
          .map(project => (
            <li key={project}>{project}</li>
          ))}
      </ul>
    </section>
  )
}
export function DuplicateNoteWithShortcut({ modifier = 'Control', ...caps }: KbdTaskOptions) {
  const [count, setCount] = useState(1),
    [open, setOpen] = useState(false),
    [message, setMessage] = useState('One study note.')
  const duplicate = () => {
    setCount(current => current + 1)
    setMessage('A study note was duplicated.')
    setOpen(false)
  }
  const onShortcut = (event: KeyboardEvent) => {
    if (matches(event, modifier, 'd')) {
      event.preventDefault()
      duplicate()
    }
  }
  return (
    <section
      aria-label="Study notes"
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
    >
      <Menu
        open={open}
        onOpenChange={setOpen}
      >
        <MenuTrigger onKeyDown={onShortcut}>Study note actions</MenuTrigger>
        <MenuPortal>
          <MenuContent style={{ minWidth: '18rem' }}>
            <MenuItem
              onKeyDown={onShortcut}
              aria-keyshortcuts={`${modifier === 'Command' ? 'Meta' : 'Control'}+D`}
              onClick={duplicate}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                Duplicate note
                <Chord
                  {...caps}
                  modifier={modifier}
                  letter="d"
                  hidden
                />
              </span>
            </MenuItem>
          </MenuContent>
        </MenuPortal>
      </Menu>
      <ul>
        {Array.from({ length: count }, (_, index) => (
          <li key={index}>{index === 0 ? 'Original study note' : `Study note copy ${index}`}</li>
        ))}
      </ul>
      <output aria-live="polite">{message}</output>
    </section>
  )
}
export function SaveNoteWithShortcut({ modifier = 'Control', ...caps }: KbdTaskOptions) {
  const form = useRef<HTMLFormElement>(null),
    [message, setMessage] = useState('Edit the note, then save it.')
  const onShortcut = (event: KeyboardEvent) => {
    if (matches(event, modifier, 's')) {
      event.preventDefault()
      form.current?.requestSubmit()
    }
  }
  return (
    <form
      ref={form}
      style={{ display: 'grid', gap: '1rem', width: 'min(32rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(`Saved note: ${new FormData(event.currentTarget).get('note')}`)
      }}
      onReset={() => setMessage('Note restored.')}
    >
      <Field
        label="Study note"
        required
      >
        <Textarea
          onKeyDown={onShortcut}
          name="note"
          defaultValue="Check the interview summary."
        />
      </Field>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button
          onKeyDown={onShortcut}
          type="submit"
          aria-keyshortcuts={`${modifier === 'Command' ? 'Meta' : 'Control'}+S`}
        >
          Save note
        </Button>
        <Tooltip>
          <TooltipTrigger
            onKeyDown={onShortcut}
            aria-label="Saving shortcut"
            variant="outline"
          >
            ?
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              Save with{' '}
              <Chord
                {...caps}
                modifier={modifier}
                letter="s"
              />{' '}
              while focus is in this note.
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
        <Button
          onKeyDown={onShortcut}
          type="reset"
          variant="outline"
        >
          Restore note
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type KbdTask = 'find' | 'duplicate' | 'save'
export function KbdExample({ task = 'find', ...options }: KbdTaskOptions & { task?: KbdTask }) {
  return (
    <MotionProvider>
      {task === 'duplicate' ? (
        <DuplicateNoteWithShortcut {...options} />
      ) : task === 'save' ? (
        <SaveNoteWithShortcut {...options} />
      ) : (
        <FindProjectWithShortcut {...options} />
      )}
    </MotionProvider>
  )
}
