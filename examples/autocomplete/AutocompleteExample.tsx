'use client'
import { useEffect, useState } from 'react'
import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteTrigger,
  AutocompleteClear,
  AutocompletePortal,
  AutocompleteContent,
  Button,
  Field,
  type AutocompleteProps,
  type AutocompleteInputProps,
  type AutocompleteContentProps,
  type AutocompleteOption
} from '@cognitap/radiant'
export type AutocompleteTaskOptions = Pick<
  AutocompleteProps,
  'controlSize' | 'disabled' | 'readOnly' | 'required'
> &
  Pick<AutocompleteInputProps, 'dir' | 'className' | 'style' | 'placeholder'> & {
    invalid?: boolean
    motion?: AutocompleteContentProps['motion']
  }
export const topicSuggestions: AutocompleteOption[] = [
  { value: 'Reading speed', label: 'Reading speed' },
  { value: 'Screen reader navigation', label: 'Screen reader navigation' },
  { value: 'Keyboard workflows', label: 'Keyboard workflows' },
  { value: 'Archived survey', label: 'Archived survey', disabled: true }
]
const recipients: AutocompleteOption[] = [
  { value: 'maya@example.com', label: 'Maya Chen', textValue: 'Maya Chen maya@example.com' },
  { value: 'ivo@example.com', label: 'Ivo Novak', textValue: 'Ivo Novak ivo@example.com' },
  { value: 'kai@example.com', label: 'Kai Reed', textValue: 'Kai Reed kai@example.com' }
]
const datasets: AutocompleteOption[] = [
  { value: 'Reader study', label: 'Reader study' },
  { value: 'Navigation sessions', label: 'Navigation sessions' },
  { value: 'Keyboard diary', label: 'Keyboard diary' },
  { value: 'Release review', label: 'Release review' }
]
const layout = { display: 'grid', gap: '1rem', width: '100%', maxWidth: '26rem', minWidth: 0 },
  actions = { display: 'flex', gap: '.75rem', flexWrap: 'wrap' } as const
/** Native props and styles belong to the actual input; the root owns its text value. */
export function CompletionInput({
  options,
  clear = false,
  ...native
}: { options: AutocompleteTaskOptions; clear?: boolean } & AutocompleteInputProps) {
  return (
    <>
      <div
        dir={options.dir}
        style={{ position: 'relative', minWidth: 0 }}
      >
        <AutocompleteInput
          {...native}
          dir={options.dir}
          className={options.className}
          style={options.style}
          placeholder={options.placeholder ?? native.placeholder}
        />
        {clear ? (
          <AutocompleteClear className="absolute inset-y-0 end-0 w-12" />
        ) : (
          <AutocompleteTrigger className="absolute inset-y-0 end-0 w-12" />
        )}
      </div>
      <AutocompletePortal>
        <AutocompleteContent motion={options.motion} />
      </AutocompletePortal>
    </>
  )
}
export function PlanResearchTopic({ required = true, ...options }: AutocompleteTaskOptions) {
  const [feedback, setFeedback] = useState('')
  return (
    <form
      style={layout}
      dir={options.dir}
      onSubmit={event => {
        event.preventDefault()
        setFeedback(
          options.invalid
            ? 'Review the topic before preparing the study.'
            : `Study topic prepared: ${new FormData(event.currentTarget).get('topic')}.`
        )
      }}
      onReset={() => setFeedback('Topic reset.')}
    >
      <Field
        label="Study topic"
        description="Choose a saved topic or write a new one."
        required={required}
        disabled={options.disabled}
        error={options.invalid ? 'Review the topic.' : undefined}
      >
        <Autocomplete
          items={topicSuggestions}
          name="topic"
          defaultValue="Reading speed"
          controlSize={options.controlSize}
          readOnly={options.readOnly}
          emptyText="No saved topics match. You can still write your own."
        >
          <CompletionInput
            options={options}
            placeholder="Write or choose a topic"
          />
        </Autocomplete>
      </Field>
      <div style={actions}>
        <Button
          type="submit"
          disabled={options.disabled}
        >
          Prepare study
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={options.disabled}
        >
          Restore initial topic
        </Button>
      </div>
      <output>{feedback}</output>
    </form>
  )
}
export function PrepareParticipantInvitation({
  required = true,
  ...options
}: AutocompleteTaskOptions) {
  const [recipient, setRecipient] = useState('maya@example.com'),
    [feedback, setFeedback] = useState('')
  return (
    <form
      style={layout}
      dir={options.dir}
      onSubmit={event => {
        event.preventDefault()
        setFeedback(
          options.invalid
            ? 'Review the recipient before preparing the invitation.'
            : `Invitation prepared for ${new FormData(event.currentTarget).get('recipient')}.`
        )
      }}
      onReset={() => {
        setRecipient('maya@example.com')
        setFeedback('Recipient reset.')
      }}
    >
      <Field
        label="Recipient email"
        description="Choose a known person or enter any email address."
        required={required}
        disabled={options.disabled}
        error={options.invalid ? 'Review the recipient.' : undefined}
      >
        <Autocomplete
          items={recipients}
          name="recipient"
          value={recipient}
          onValueChange={setRecipient}
          controlSize={options.controlSize}
          readOnly={options.readOnly}
          emptyText="No known recipients match. You can still enter an email address."
        >
          <CompletionInput
            options={options}
            clear
            inputMode="email"
            autoComplete="email"
            pattern={'[^\\s@]+@[^\\s@]+\\.[^\\s@]+'}
            placeholder="participant@example.com"
          />
        </Autocomplete>
      </Field>
      <div style={actions}>
        <Button
          type="submit"
          disabled={options.disabled}
        >
          Prepare invitation
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={options.disabled}
        >
          Restore recipient
        </Button>
      </div>
      <output>{feedback}</output>
    </form>
  )
}
/** The application owns delayed requests, cancellation and recovery. */
export function FindStudyDataset({ required = true, ...options }: AutocompleteTaskOptions) {
  const [value, setValue] = useState(''),
    [connected, setConnected] = useState(true),
    [feedback, setFeedback] = useState(''),
    [result, setResult] = useState<{
      query: string
      connected: boolean
      items: AutocompleteOption[]
      error?: string
    }>({ query: '', connected: true, items: datasets })
  useEffect(() => {
    let current = true
    const timer = setTimeout(() => {
      if (!current) return
      setResult({
        query: value,
        connected,
        items: connected
          ? datasets.filter(item => item.value.toLowerCase().includes(value.toLowerCase()))
          : [],
        error: connected
          ? undefined
          : 'The catalog is unavailable. You can still enter a dataset name.'
      })
    }, 350)
    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [value, connected])
  const loading = result.query !== value || result.connected !== connected
  return (
    <form
      style={layout}
      dir={options.dir}
      onSubmit={event => {
        event.preventDefault()
        setFeedback(
          options.invalid
            ? 'Review the dataset before preparing the request.'
            : `Dataset request prepared: ${new FormData(event.currentTarget).get('dataset')}.`
        )
      }}
      onReset={() => {
        setValue('')
        setFeedback('Dataset request reset.')
      }}
    >
      <Field
        label="Dataset name"
        description="Find a saved study dataset or name a new one."
        required={required}
        disabled={options.disabled}
        error={options.invalid ? 'Review the dataset.' : undefined}
      >
        <Autocomplete
          items={result.items}
          filter={null}
          name="dataset"
          value={value}
          onValueChange={setValue}
          controlSize={options.controlSize}
          readOnly={options.readOnly}
          loading={loading}
          errorText={loading ? undefined : result.error}
          loadingText="Looking up datasets…"
          emptyText="No saved datasets match. You can still enter a new name."
        >
          <CompletionInput
            options={options}
            placeholder="Search or write a dataset name"
          />
        </Autocomplete>
      </Field>
      <div style={actions}>
        <Button
          type="submit"
          disabled={options.disabled}
        >
          Prepare dataset request
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
          disabled={options.disabled}
        >
          Clear request
        </Button>
        <Button
          type="button"
          variant="outline"
          tone="neutral"
          disabled={options.disabled}
          onClick={() => setConnected(current => !current)}
        >
          {connected ? 'Disconnect catalog' : 'Reconnect catalog'}
        </Button>
      </div>
      <p>{connected ? 'Sample catalog connected.' : 'Sample catalog disconnected.'}</p>
      <output>{feedback}</output>
    </form>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type AutocompleteTask = 'topic' | 'invitation' | 'dataset'
export function AutocompleteExample({
  task = 'topic',
  ...props
}: AutocompleteTaskOptions & { task?: AutocompleteTask }) {
  return (
    <MotionProvider>
      {task === 'invitation' ? (
        <PrepareParticipantInvitation {...props} />
      ) : task === 'dataset' ? (
        <FindStudyDataset {...props} />
      ) : (
        <PlanResearchTopic {...props} />
      )}
    </MotionProvider>
  )
}
