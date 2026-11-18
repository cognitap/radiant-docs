'use client'

import { ColorInput, Field } from '@cognitap/radiant'

export function EditAccent() {
  return (
    <Field
      label="Accent color"
      className="w-full max-w-xs"
    >
      <ColorInput defaultValue="#405CE0" />
    </Field>
  )
}
