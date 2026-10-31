'use client'
import { useState } from 'react'
import { useForm as useTanStackForm } from '@tanstack/react-form'
import {
  Button,
  Field,
  Form,
  FormError,
  FormField,
  Input,
  type FormErrors
} from '@cognitap/radiant'

function validateWorkspace(data: FormData): FormErrors {
  const slug = String(data.get('slug') ?? '')
  return {
    fields: !/^[a-z][a-z0-9-]{2,}$/.test(slug)
      ? { slug: 'Use at least three lowercase letters, numbers or hyphens.' }
      : {}
  }
}
export function CreateResearchWorkspace() {
  const [saved, setSaved] = useState('')
  return (
    <section className="grid w-full max-w-lg gap-4">
      <h2>Create a research workspace</h2>
      <p>Choose where your study invitations and results will live.</p>
      <Form
        aria-label="Create workspace"
        validate={validateWorkspace}
        onSubmitValues={data => {
          setSaved(`Created ${String(data.get('slug'))} for ${String(data.get('email'))}.`)
        }}
        onReset={() => setSaved('')}
      >
        {({ pending }) => (
          <>
            <FormField
              name="email"
              label="Owner email"
              description="We send the workspace invitation here."
              required
            >
              <Input
                name="email"
                type="email"
                autoComplete="email"
              />
            </FormField>
            <FormField
              name="slug"
              label="Workspace address"
              description="For example, atlas-research."
              required
            >
              <Input
                name="slug"
                autoComplete="off"
              />
            </FormField>
            <FormError />
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                pending={pending}
              >
                Create workspace
              </Button>
              <Button
                type="reset"
                variant="outline"
                tone="neutral"
              >
                Reset workspace
              </Button>
            </div>
          </>
        )}
      </Form>
      <output>{saved}</output>
    </section>
  )
}
export function RecoverWorkspaceInvitation() {
  const [saved, setSaved] = useState('')
  return (
    <section className="grid w-full max-w-lg gap-4">
      <h2>Invite a study collaborator</h2>
      <p>Try taken@example.com to review a server rejection, then use another email.</p>
      <Form
        aria-label="Invite collaborator"
        onSubmitValues={async (data, { signal }) => {
          await new Promise<void>(resolve => setTimeout(resolve, 250))
          if (signal.aborted) return
          const email = String(data.get('email'))
          if (email === 'taken@example.com')
            return {
              fields: { email: 'This collaborator already belongs to the workspace.' },
              form: 'The invitation was not sent. Check the email address.'
            }
          setSaved(`Invitation sent to ${email}.`)
        }}
        onReset={() => setSaved('')}
      >
        {({ pending }) => (
          <>
            <FormField
              name="email"
              label="Collaborator email"
              required
            >
              <Input
                name="email"
                type="email"
                autoComplete="email"
              />
            </FormField>
            <FormError />
            <div className="flex gap-2">
              <Button
                type="submit"
                pending={pending}
              >
                Send invitation
              </Button>
              <Button
                type="reset"
                variant="outline"
              >
                Reset invitation
              </Button>
            </div>
          </>
        )}
      </Form>
      <output>{saved}</output>
    </section>
  )
}
export function EditProfileWithTanStack() {
  const [saved, setSaved] = useState('')
  const form = useTanStackForm({
    defaultValues: { email: 'researcher@example.com' },
    onSubmit: ({ value }) => {
      setSaved(`Profile saved for ${value.email}.`)
    }
  })
  return (
    <section className="grid w-full max-w-lg gap-4">
      <h2>Update your research profile</h2>
      <p>TanStack owns the value; the same native form coordinates validation and submission.</p>
      <Form
        aria-label="Research profile"
        onSubmitValues={async () => {
          await form.handleSubmit()
        }}
        onReset={() => {
          form.reset()
          setSaved('')
        }}
      >
        {({ pending }) => (
          <>
            <form.Field name="email">
              {field => (
                <FormField
                  name={field.name}
                  label="Email"
                  required
                >
                  <Input
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onChange={event => field.handleChange(event.currentTarget.value)}
                    onBlur={field.handleBlur}
                  />
                </FormField>
              )}
            </form.Field>
            <Field
              label="Organisation"
              disabled
            >
              <Input
                defaultValue="Cognitap"
                name="organisation"
              />
            </Field>
            <FormError />
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                pending={pending}
              >
                Save profile
              </Button>
              <Button
                type="reset"
                variant="outline"
              >
                Reset profile
              </Button>
            </div>
          </>
        )}
      </Form>
      <output>{saved}</output>
    </section>
  )
}
