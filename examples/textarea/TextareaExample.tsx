'use client'

import { useRef, useState } from 'react'
import { Button, Field, Textarea, type TextareaProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import { useHydrated } from '../profile/useHydrated'
import './textarea-example.css'

export type TextareaTaskOptions = Pick<TextareaProps, 'controlSize' | 'disabled' | 'readOnly'> & {
  invalid?: boolean
}

export function DescribeProject({ invalid, ...props }: TextareaTaskOptions) {
  return (
    <div className="textarea-example">
      <Field
        label="Project description"
        description="A few lines about what you are making."
        error={invalid ? 'Add a description.' : undefined}
        required
      >
        <Textarea
          {...props}
          name="description"
          defaultValue={'A shared notebook for field research.\nStarts with interview notes.'}
        />
      </Field>
    </div>
  )
}

const initialIntroduction =
  'A quiet place to turn an idea into something useful.\nStart with a small sketch.'

export function IntroduceWorkspace({ controlSize }: TextareaTaskOptions) {
  const ready = useHydrated()
  const [introduction, setIntroduction] = useState(initialIntroduction)
  const [touched, setTouched] = useState(false)
  const [feedback, setFeedback] = useState('No changes saved')
  const introductionRef = useRef<HTMLTextAreaElement>(null)
  const error = introduction.trim() ? undefined : 'Write a short introduction.'
  return (
    <form
      aria-label="Workspace introduction"
      className="textarea-example"
      noValidate
      onSubmit={event => {
        event.preventDefault()
        setTouched(true)
        if (error) {
          introductionRef.current?.focus()
          return
        }
        const data = new FormData(event.currentTarget)
        setFeedback(`Saved: ${data.get('introduction')} · ${data.get('notes')}`)
      }}
      onReset={() => {
        setIntroduction(initialIntroduction)
        setTouched(false)
        setFeedback('Draft reset')
      }}
    >
      <Field
        label="Introduction"
        required
        description={`${introduction.length}/300 characters.`}
        error={touched ? error : undefined}
      >
        <Textarea
          ref={introductionRef}
          name="introduction"
          controlSize={controlSize}
          value={introduction}
          rows={4}
          maxLength={300}
          onChange={event => setIntroduction(event.target.value)}
        />
      </Field>
      <Field
        label="Private notes"
        description="Uncontrolled. Reset restores its default value."
      >
        <Textarea
          name="notes"
          controlSize={controlSize}
          defaultValue="Share a first draft on Friday."
          rows={2}
        />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
        <Button
          type="submit"
          controlSize={controlSize}
          disabled={!ready}
        >
          Save introduction
        </Button>
        <Button
          type="reset"
          controlSize={controlSize}
          disabled={!ready}
          variant="outline"
          tone="neutral"
        >
          Reset draft
        </Button>
      </div>
      <output style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{feedback}</output>
    </form>
  )
}

export function WriteReply({ controlSize }: TextareaTaskOptions) {
  return (
    <div className="textarea-example">
      <Field
        label="Reply"
        description="Grows with each line, then scrolls past ten lines."
      >
        <Textarea
          name="reply"
          controlSize={controlSize}
          rows={1}
          placeholder="Write a reply…"
          className="textarea-auto-grow"
        />
      </Field>
    </div>
  )
}

export type TextareaTask = 'describe' | 'introduce' | 'reply'

export function TextareaExample({
  task = 'describe',
  ...options
}: TextareaTaskOptions & { task?: TextareaTask }) {
  return task === 'introduce' ? (
    <IntroduceWorkspace {...options} />
  ) : task === 'reply' ? (
    <WriteReply {...options} />
  ) : (
    <DescribeProject {...options} />
  )
}
