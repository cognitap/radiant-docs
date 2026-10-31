'use client'
import { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Field,
  MultiSelect,
  MultiSelectTags,
  MultiSelectInput,
  MultiSelectTrigger,
  MultiSelectClear,
  MultiSelectPortal,
  MultiSelectContent,
  type MultiSelectProps,
  type MultiSelectInputProps,
  type MultiSelectContentProps,
  type MultiSelectOption
} from '@cognitap/radiant'
export type MultiTaskOptions = Pick<
  MultiSelectProps,
  'controlSize' | 'disabled' | 'loading' | 'emptyText' | 'loadingText'
> &
  Pick<MultiSelectInputProps, 'className' | 'style' | 'readOnly'> &
  Pick<MultiSelectContentProps, 'motion' | 'sideOffset' | 'collisionPadding'> & {
    dir?: 'ltr' | 'rtl'
    initialOpen?: boolean
    initialValues?: string[]
    fail?: boolean
  }
const people: MultiSelectOption[] = [
  { value: 'ana', label: 'Ana Petrescu' },
  { value: 'sam', label: 'Sam Novak' },
  { value: 'lee', label: 'Lee Park' },
  { value: 'casey', label: 'Casey Moore', disabled: true }
]
function Editor({
  className,
  style,
  readOnly,
  motion,
  sideOffset,
  collisionPadding
}: MultiTaskOptions) {
  return (
    <>
      <MultiSelectTags />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <MultiSelectInput
          className={className}
          style={style}
          readOnly={readOnly}
        />
        <MultiSelectTrigger />
        <MultiSelectClear />
      </div>
      <MultiSelectPortal>
        <MultiSelectContent
          motion={motion}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
        />
      </MultiSelectPortal>
    </>
  )
}
export function AssignProjectReviewers({
  dir,
  initialOpen,
  initialValues = ['ana'],
  disabled,
  readOnly,
  loading = false,
  fail = false,
  controlSize,
  emptyText,
  loadingText,
  ...editor
}: MultiTaskOptions) {
  const [values, setValues] = useState(initialValues),
    [query, setQuery] = useState(''),
    [message, setMessage] = useState('Choose reviewers for the project brief.')
  const [result, setResult] = useState<{
    query: string
    items: MultiSelectOption[]
    error?: string
  }>({ query: '', items: people })
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      if (controller.signal.aborted) return
      setResult(
        fail || query.toLowerCase() === 'error'
          ? { query, items: [], error: 'The reviewer lookup failed. Change your search to retry.' }
          : {
              query,
              items: people.filter(person =>
                String(person.label).toLowerCase().includes(query.toLowerCase())
              )
            }
      )
    }, 350)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query, fail])
  return (
    <form
      dir={dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setMessage(
          `Reviewers saved: ${new FormData(event.currentTarget).getAll('reviewers').join(', ') || 'none'}.`
        )
      }}
      onReset={() => {
        setValues(initialValues)
        setQuery('')
        setMessage('Reviewers restored.')
      }}
    >
      <Field
        label="Project reviewers"
        description="Search by name; selected reviewers remain available while results load."
        required
      >
        <MultiSelect
          items={result.items}
          selectedItems={people}
          filter={null}
          query={query}
          onQueryChange={setQuery}
          value={values}
          onValueChange={setValues}
          name="reviewers"
          loading={loading || result.query !== query}
          errorText={result.query === query ? result.error : undefined}
          defaultOpen={initialOpen}
          disabled={disabled}
          readOnly={readOnly}
          controlSize={controlSize}
          emptyText={emptyText}
          loadingText={loadingText}
        >
          <Editor {...editor} />
        </MultiSelect>
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button type="submit">Save reviewers</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset reviewers
        </Button>
      </div>
      <output aria-live="polite">{message}</output>
    </form>
  )
}
const labels = [
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'delivery', label: 'Delivery' }
]
export function FilterReleaseBoard({
  dir,
  initialOpen,
  initialValues = ['design'],
  disabled,
  readOnly,
  loading,
  controlSize,
  emptyText,
  loadingText,
  ...editor
}: MultiTaskOptions) {
  const [applied, setApplied] = useState(initialValues)
  const projects = [
    { name: 'Component kit', label: 'design' },
    { name: 'Reader study', label: 'research' },
    { name: 'Release checklist', label: 'delivery' }
  ]
  return (
    <form
      dir={dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
      onSubmit={event => {
        event.preventDefault()
        setApplied(new FormData(event.currentTarget).getAll('labels').map(String))
      }}
      onReset={() => setApplied(initialValues)}
    >
      <Field
        label="Board labels"
        description="Apply one or more labels to the release board."
      >
        <MultiSelect
          items={labels}
          name="labels"
          defaultValue={initialValues}
          defaultOpen={initialOpen}
          disabled={disabled}
          readOnly={readOnly}
          loading={loading}
          controlSize={controlSize}
          emptyText={emptyText}
          loadingText={loadingText}
        >
          <Editor {...editor} />
        </MultiSelect>
      </Field>
      <Button type="submit">Apply board filters</Button>
      <ul>
        {projects
          .filter(project => !applied.length || applied.includes(project.label))
          .map(project => (
            <li key={project.name}>{project.name}</li>
          ))}
      </ul>
      <Button
        type="reset"
        variant="outline"
      >
        Reset board filters
      </Button>
    </form>
  )
}
export function KeepLeadReviewer({
  dir,
  initialOpen,
  initialValues = ['ana'],
  disabled,
  readOnly,
  loading,
  controlSize,
  emptyText,
  loadingText,
  ...editor
}: MultiTaskOptions) {
  const [values, setValues] = useState(initialValues),
    [keep, setKeep] = useState(true),
    [message, setMessage] = useState('The project lead is required for this review.')
  return (
    <div
      dir={dir}
      style={{ display: 'grid', gap: '1rem', width: 'min(34rem,100%)' }}
    >
      <Checkbox
        label="Keep the lead reviewer"
        checked={keep}
        onChange={event => setKeep(event.currentTarget.checked)}
      />
      <Field label="Required reviewers">
        <MultiSelect
          items={people}
          value={values}
          onValueChange={next => {
            if (keep && !next.includes('ana'))
              setMessage('The lead reviewer must stay until review is complete.')
            else {
              setValues(next)
              setMessage(`Reviewers: ${next.join(', ') || 'none'}.`)
            }
          }}
          defaultOpen={initialOpen}
          disabled={disabled}
          readOnly={readOnly}
          loading={loading}
          controlSize={controlSize}
          emptyText={emptyText}
          loadingText={loadingText}
        >
          <Editor {...editor} />
        </MultiSelect>
      </Field>
      <output aria-live="polite">{message}</output>
    </div>
  )
}

import '@cognitap/radiant/styles.css'
import { MotionProvider } from '@cognitap/radiant/motion/react'
export type MultiSelectTask = 'reviewers' | 'board' | 'lead'
export function MultiSelectExample({
  task = 'reviewers',
  ...options
}: MultiTaskOptions & { task?: MultiSelectTask }) {
  return (
    <MotionProvider>
      {task === 'reviewers' ? (
        <AssignProjectReviewers {...options} />
      ) : task === 'board' ? (
        <FilterReleaseBoard {...options} />
      ) : (
        <KeepLeadReviewer {...options} />
      )}
    </MotionProvider>
  )
}
