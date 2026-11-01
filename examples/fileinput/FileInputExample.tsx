'use client'
import { useState } from 'react'
import { Button, Field, FileInput, type FileInputProps } from '@cognitap/radiant'
export type FileInputTaskOptions = Pick<
  FileInputProps,
  'controlSize' | 'dir' | 'className' | 'style' | 'chooseLabel' | 'emptyText' | 'disabled'
> & { invalid?: boolean; required?: boolean }
const layout = { display: 'grid', gap: '1rem', width: '100%', maxWidth: '28rem', minWidth: 0 }
const row = { display: 'flex', flexWrap: 'wrap', gap: '.5rem' } as const
const kilobytes = (files: File[]) =>
  `${Math.max(1, Math.round(files.reduce((total, file) => total + file.size, 0) / 1024))} KB`
export function AttachStudyProtocol({ invalid, required, ...props }: FileInputTaskOptions) {
  const [summary, setSummary] = useState('No protocol attached.')
  return (
    <div style={layout}>
      <Field
        label="Study protocol"
        description="A PDF or Word document."
        required={required}
        disabled={props.disabled}
        error={invalid ? 'Attach the protocol.' : undefined}
      >
        <FileInput
          {...props}
          name="protocol"
          accept=".pdf,.doc,.docx"
          onChange={event => {
            const [file] = Array.from(event.currentTarget.files ?? [])
            setSummary(file ? `${file.name}, ${kilobytes([file])}.` : 'No protocol attached.')
          }}
        />
      </Field>
      <output aria-live="polite">{summary}</output>
    </div>
  )
}
export function AttachSessionRecordings({ invalid, required, ...props }: FileInputTaskOptions) {
  const [files, setFiles] = useState<File[]>([])
  return (
    <div style={layout}>
      <Field
        label="Session recordings"
        description="Audio or video, as many as you have."
        required={required}
        disabled={props.disabled}
        error={invalid ? 'Attach at least one recording.' : undefined}
      >
        <FileInput
          {...props}
          name="recordings"
          accept="audio/*,video/*"
          multiple
          onChange={event => setFiles(Array.from(event.currentTarget.files ?? []))}
        />
      </Field>
      <output aria-live="polite">
        {files.length === 0
          ? 'No recordings attached.'
          : `${files.length} ${files.length === 1 ? 'recording' : 'recordings'}, ${kilobytes(files)}.`}
      </output>
    </div>
  )
}
export function SubmitConsentForm({ invalid, required = true, ...props }: FileInputTaskOptions) {
  const [message, setMessage] = useState('Attach the signed form to submit.')
  return (
    <form
      aria-label="Participant consent"
      style={layout}
      onSubmit={event => {
        event.preventDefault()
        const file = new FormData(event.currentTarget).get('consent')
        setMessage(
          file instanceof File && file.name
            ? `Submitted ${file.name} as consent.`
            : 'No file was submitted.'
        )
      }}
      onReset={() => setMessage('Form cleared.')}
    >
      <Field
        label="Signed consent form"
        description="PDF or image, one file."
        required={required}
        disabled={props.disabled}
        error={invalid ? 'Attach the signed form.' : undefined}
      >
        <FileInput
          {...props}
          name="consent"
          accept="application/pdf,image/*"
        />
      </Field>
      <div style={row}>
        <Button
          type="submit"
          disabled={props.disabled}
        >
          Submit consent
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={props.disabled}
        >
          Clear form
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type FileInputTask = 'protocol' | 'recordings' | 'consent'
export function FileInputExample({
  task = 'protocol',
  ...props
}: FileInputTaskOptions & { task?: FileInputTask }) {
  return (
    <MotionProvider>
      {task === 'recordings' ? (
        <AttachSessionRecordings {...props} />
      ) : task === 'consent' ? (
        <SubmitConsentForm {...props} />
      ) : (
        <AttachStudyProtocol {...props} />
      )}
    </MotionProvider>
  )
}
