'use client'
import { useEffect, useId, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  Field,
  Input,
  Textarea,
  type ButtonProps,
  type ButtonRenderProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type ButtonTask = 'save' | 'format' | 'bookmark' | 'adapter'
type Presentation = Pick<
  ButtonProps,
  'disabled' | 'pending' | 'variant' | 'tone' | 'controlSize' | 'motion'
>
export function ButtonExample({ task = 'save', ...props }: Presentation & { task?: ButtonTask }) {
  return (
    <MotionProvider>
      {task === 'format' ? (
        <Formatting {...props} />
      ) : task === 'bookmark' ? (
        <Bookmark {...props} />
      ) : task === 'adapter' ? (
        <Exporting {...props} />
      ) : (
        <Saving {...props} />
      )}
    </MotionProvider>
  )
}
function Saving({ disabled, pending, ...props }: Presentation) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    [saving, setSaving] = useState(false),
    [fail, setFail] = useState(false),
    [message, setMessage] = useState('No changes saved.')
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )
  return (
    <form
      style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}
      onReset={() => setMessage('No changes saved.')}
      onSubmit={event => {
        event.preventDefault()
        if (timer.current !== null || disabled || pending) return
        const name = String(new FormData(event.currentTarget).get('workspace'))
        setSaving(true)
        setMessage('Saving workspace…')
        timer.current = setTimeout(() => {
          timer.current = null
          setSaving(false)
          setMessage(fail ? 'Could not save. Try again.' : `Saved “${name}”.`)
        }, 650)
      }}
    >
      <Field
        label="Workspace name"
        required
      >
        <Input
          name="workspace"
          defaultValue="Orbit Studio"
          autoComplete="organization"
          disabled={disabled || saving}
        />
      </Field>
      <Checkbox
        label="Simulate a failed request"
        checked={fail}
        onChange={event => setFail(event.target.checked)}
        disabled={saving}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
        <Button
          {...props}
          disabled={disabled}
          pending={pending || saving}
          type="submit"
        >
          Save changes
        </Button>
        <Button
          type="reset"
          variant="ghost"
          tone="neutral"
          disabled={saving}
        >
          Discard draft
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
function Formatting({ variant, ...props }: Presentation) {
  const [bold, setBold] = useState(false),
    [italic, setItalic] = useState(true)
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <Button
          {...props}
          variant={variant ?? 'outline'}
          iconOnly
          aria-label="Bold"
          pressed={bold}
          onPressedChange={setBold}
        >
          <strong>B</strong>
        </Button>
        <Button
          {...props}
          variant={variant ?? 'outline'}
          iconOnly
          aria-label="Italic"
          defaultPressed
          onPressedChange={setItalic}
        >
          <em>I</em>
        </Button>
      </div>
      <Field label="Draft">
        <Textarea
          defaultValue="Make the next step clear."
          style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal' }}
        />
      </Field>
    </div>
  )
}
function Bookmark({ variant, pending, ...props }: Presentation) {
  const [saved, setSaved] = useState(false),
    [syncing, setSyncing] = useState(false)
  return (
    <article style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}>
      <h3 style={{ margin: 0 }}>Designing a quieter workspace</h3>
      <Button
        {...props}
        variant={variant ?? 'soft'}
        pending={pending || syncing}
        defaultPressed={false}
        onPressedChange={setSaved}
        fullWidth
      >
        Bookmark article
      </Button>
      <output aria-live="polite">
        {saved ? 'Saved to your reading list.' : 'Article is not bookmarked.'}
      </output>
      <Checkbox
        label="Sync in progress"
        checked={syncing}
        onChange={event => setSyncing(event.target.checked)}
      />
    </article>
  )
}
function ConsumerButton({ children, ...props }: ButtonRenderProps) {
  return <button {...props}>{children}</button>
}
function Exporting({ variant, ...props }: Presentation) {
  const id = useId(),
    ref = useRef<HTMLButtonElement>(null),
    [result, setResult] = useState('No export requested.')
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '26rem', maxWidth: '100%' }}>
      <form
        id={id}
        onSubmit={event => {
          event.preventDefault()
          const data = new FormData(
            event.currentTarget,
            (event.nativeEvent as SubmitEvent).submitter
          )
          setResult(`Requested ${data.get('intent')}.`)
        }}
      />
      <Button
        {...props}
        variant={variant ?? 'outline'}
        ref={ref}
        form={id}
        type="submit"
        name="intent"
        value="report export"
        fullWidth
        style={{ '--rad-button-radius': '999px' }}
        render={resolved => <ConsumerButton {...resolved} />}
      >
        Export the current report for your team
      </Button>
      <Button
        variant="ghost"
        onClick={() => ref.current?.focus()}
      >
        Focus export action
      </Button>
      <output aria-live="polite">{result}</output>
    </div>
  )
}
