'use client'

import { useId, useState } from 'react'
import { Button, Checkbox, Field, Input, Radio, RadioGroup } from '@cognitap/radiant'
import { defaultProfile, validateEmail, validateName, type ProfileFormProps } from './profile'
import { useHydrated } from './useHydrated'

export function NativeProfileForm({ onSave, onReset }: ProfileFormProps) {
  const formId = useId()
  const ready = useHydrated()
  const [errors, setErrors] = useState<{ displayName?: string; email?: string }>({})

  return (
    <form
      id={formId}
      className="profile-form"
      aria-label="Edit profile"
      noValidate
      onChange={onReset}
      onReset={() => {
        setErrors({})
        onReset()
      }}
      onSubmit={event => {
        event.preventDefault()
        const form = event.currentTarget
        const data = new FormData(form)
        const displayName = String(data.get('displayName') ?? '').trim()
        const email = String(data.get('email') ?? '').trim()
        const nextErrors = { displayName: validateName(displayName), email: validateEmail(email) }
        setErrors(nextErrors)
        if (nextErrors.displayName || nextErrors.email) {
          const name = nextErrors.displayName ? 'displayName' : 'email'
          form.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.focus()
          return
        }
        onSave({
          displayName,
          email,
          contact: data.get(`${formId}-contact`) === 'none' ? 'none' : 'email',
          updates: data.has('updates')
        })
      }}
    >
      <Field
        label="Display name"
        description="The name people will see on your profile."
        error={errors.displayName}
        required
      >
        <Input
          name="displayName"
          autoComplete="name"
          defaultValue={defaultProfile.displayName}
        />
      </Field>
      <Field
        label="Email address"
        description="Used for account messages."
        error={errors.email}
        required
      >
        <Input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultProfile.email}
        />
      </Field>
      <RadioGroup
        name={`${formId}-contact`}
        label="Contact preference"
        description="Choose whether people can contact you by email."
        defaultValue={defaultProfile.contact}
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
      <Field
        label="Product updates"
        description="Occasional release notes. You can opt out at any time."
      >
        <Checkbox
          name="updates"
          defaultChecked={defaultProfile.updates}
        />
      </Field>
      <div className="profile-actions">
        <Button
          type="submit"
          disabled={!ready}
        >
          Save profile
        </Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset form
        </Button>
      </div>
    </form>
  )
}
