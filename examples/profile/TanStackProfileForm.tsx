'use client'

import { useId, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Checkbox, Field, Input, Radio, RadioGroup } from '@cognitap/radiant'
import { defaultProfile, validateEmail, validateName, type ProfileFormProps } from './profile'
import { useHydrated } from './useHydrated'

export function TanStackProfileForm({ onSave, onReset }: ProfileFormProps) {
  const formId = useId()
  const ready = useHydrated()
  const element = useRef<HTMLFormElement>(null)
  const form = useForm({
    defaultValues: { ...defaultProfile },
    onSubmit: ({ value }) => {
      onSave({ ...value, displayName: value.displayName.trim(), email: value.email.trim() })
    },
    onSubmitInvalid: ({ formApi }) => {
      const name = validateName(formApi.state.values.displayName) ? 'displayName' : 'email'
      element.current?.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.focus()
    }
  })

  return (
    <form
      id={formId}
      ref={element}
      className="profile-form"
      aria-label="Edit profile"
      noValidate
      onChange={onReset}
      onReset={event => {
        event.preventDefault()
        form.reset()
        onReset()
      }}
      onSubmit={event => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="displayName"
        validators={{
          onChange: ({ value }) => validateName(value)
        }}
      >
        {field => (
          <Field
            label="Display name"
            disabled={!ready}
            description="The name people will see on your profile."
            error={field.state.meta.isTouched ? field.state.meta.errors.join(' ') : undefined}
            required
          >
            <Input
              name={field.name}
              autoComplete="name"
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </Field>
        )}
      </form.Field>
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => validateEmail(value)
        }}
      >
        {field => (
          <Field
            label="Email address"
            disabled={!ready}
            description="Used for account messages."
            error={field.state.meta.isTouched ? field.state.meta.errors.join(' ') : undefined}
            required
          >
            <Input
              name={field.name}
              type="email"
              autoComplete="email"
              value={field.state.value}
              onChange={event => field.handleChange(event.target.value)}
              onBlur={field.handleBlur}
            />
          </Field>
        )}
      </form.Field>
      <form.Field name="contact">
        {field => (
          <RadioGroup
            disabled={!ready}
            name={`${formId}-contact`}
            label="Contact preference"
            description="Choose whether people can contact you by email."
            value={field.state.value}
            onBlur={field.handleBlur}
            onValueChange={value => {
              if (value === 'email' || value === 'none') field.handleChange(value)
            }}
          >
            <Radio
              value="email"
              label="Email me"
            />
            <Radio
              value="none"
              label="No contact"
            />
          </RadioGroup>
        )}
      </form.Field>
      <form.Field name="updates">
        {field => (
          <Field
            label="Product updates"
            disabled={!ready}
            description="Occasional release notes. You can opt out at any time."
          >
            <Checkbox
              name={field.name}
              checked={field.state.value}
              onChange={event => field.handleChange(event.target.checked)}
              onBlur={field.handleBlur}
            />
          </Field>
        )}
      </form.Field>
      <div className="profile-actions">
        <form.Subscribe selector={state => state.isSubmitting}>
          {submitting => (
            <Button
              type="submit"
              disabled={!ready}
              pending={submitting}
            >
              Save profile
            </Button>
          )}
        </form.Subscribe>
        <Button
          type="reset"
          disabled={!ready}
          variant="outline"
        >
          Reset form
        </Button>
      </div>
    </form>
  )
}
