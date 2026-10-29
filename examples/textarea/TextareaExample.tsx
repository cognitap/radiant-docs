'use client'

import { useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Textarea
} from '@cognitap/radiant'

import { useHydrated } from '../profile/useHydrated'

const initialMessage =
  'A quiet place to turn an idea into something useful.\nStart with a small sketch.'

export function TextareaDraftExample() {
  const ready = useHydrated()
  const [message, setMessage] = useState(initialMessage)
  const [touched, setTouched] = useState(false)
  const [feedback, setFeedback] = useState('No changes saved')
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const error = message.trim() ? undefined : 'Write a short introduction.'
  return (
    <Card style={{ maxWidth: '40rem', minWidth: 0 }}>
      <CardHeader>
        <CardTitle>Introduce your workspace</CardTitle>
        <CardDescription>Give your team a little context before they begin.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          aria-label="Workspace introduction"
          noValidate
          style={{ display: 'grid', gap: '1.5rem', minWidth: 0 }}
          onSubmit={event => {
            event.preventDefault()
            setTouched(true)
            if (error) {
              messageRef.current?.focus()
              return
            }
            const data = new FormData(event.currentTarget)
            setFeedback(`Saved locally: ${data.get('introduction')} · ${data.get('notes')}`)
          }}
          onReset={() => {
            setMessage(initialMessage)
            setTouched(false)
            setFeedback('Draft reset')
          }}
        >
          <Field
            label="Introduction"
            required
            description={`${message.length}/300 characters. Line breaks are preserved.`}
            error={touched ? error : undefined}
          >
            <Textarea
              ref={messageRef}
              name="introduction"
              value={message}
              rows={4}
              maxLength={300}
              onChange={event => setMessage(event.target.value)}
            />
          </Field>
          <Field
            label="Private notes"
            description="Optional. This browser-owned field resets with the form."
          >
            <Textarea
              name="notes"
              defaultValue="Share a first draft on Friday."
              rows={2}
              placeholder="Anything else to remember?"
            />
          </Field>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              type="submit"
              disabled={!ready}
            >
              Save introduction
            </Button>
            <Button
              type="reset"
              disabled={!ready}
              variant="outline"
              tone="neutral"
            >
              Reset draft
            </Button>
          </div>
          <output style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{feedback}</output>
        </form>
      </CardContent>
    </Card>
  )
}
