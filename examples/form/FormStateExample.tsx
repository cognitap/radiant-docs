'use client'
import { useRef, useState } from 'react'
import { Button, Form, FormError, FormField, Input, type FormErrors } from '@cognitap/radiant'

export function RetryResultsExport() {
  const attempts = useRef(0)
  const [exported, setExported] = useState('')
  return (
    <section className="grid w-full max-w-lg gap-4">
      <h2>Export study results</h2>
      <p>The export service is busy on the first attempt.</p>
      <Form
        aria-label="Export results"
        submitErrorText="The export service is unavailable. Try again in a minute."
        onSubmitValues={async data => {
          await new Promise<void>(resolve => setTimeout(resolve, 250))
          attempts.current += 1
          if (attempts.current % 2 === 1) throw new Error('Service unavailable')
          setExported(`Exported results as ${String(data.get('format'))}.`)
        }}
        onReset={() => setExported('')}
      >
        {({ pending }) => (
          <>
            <FormField
              name="format"
              label="File format"
              description="For example, csv."
              required
            >
              <Input
                name="format"
                defaultValue="csv"
              />
            </FormField>
            <FormError />
            <Button
              type="submit"
              pending={pending}
            >
              Export results
            </Button>
          </>
        )}
      </Form>
      <output>{exported}</output>
    </section>
  )
}

export function ResumeSurveyDraft() {
  return (
    <section className="grid w-full max-w-lg gap-4">
      <h2>Finish a survey draft</h2>
      <p>This draft was saved before its first question was written.</p>
      <Form
        aria-label="Draft survey"
        defaultErrors={{
          fields: { question: 'Write the first question before publishing.' },
          form: 'This draft was saved with errors.'
        }}
        onSubmitValues={() => {}}
      >
        {({ focusInvalid }) => (
          <>
            <FormField
              name="name"
              label="Survey name"
            >
              <Input
                name="name"
                defaultValue="Reading habits"
              />
            </FormField>
            <FormField
              name="question"
              label="First question"
              required
            >
              <Input name="question" />
            </FormField>
            <FormError />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={focusInvalid}
              >
                Review first error
              </Button>
              <Button type="submit">Publish survey</Button>
            </div>
          </>
        )}
      </Form>
    </section>
  )
}

const reviewerNotes: FormErrors = {
  fields: { title: 'A reviewer asked for a shorter title.' },
  form: 'A reviewer left notes on this study.'
}

export function ReviewStudyNotes() {
  const [errors, setErrors] = useState<FormErrors>({})
  const open = Object.values(errors.fields ?? {}).filter(Boolean).length
  return (
    <section className="grid w-full max-w-lg gap-4">
      <h2>Review study details</h2>
      <p>Reviewer notes come from your server and clear as you edit.</p>
      <Form
        aria-label="Study details"
        errors={errors}
        onErrorsChange={setErrors}
        onSubmitValues={() => {}}
      >
        <FormField
          name="title"
          label="Study title"
          required
        >
          <Input
            name="title"
            defaultValue="A long study of reading speed on small screens"
          />
        </FormField>
        <FormError />
        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save study</Button>
          <Button
            variant="outline"
            onClick={() => setErrors(reviewerNotes)}
          >
            Load reviewer notes
          </Button>
        </div>
      </Form>
      <output>Open field notes: {open}</output>
    </section>
  )
}
