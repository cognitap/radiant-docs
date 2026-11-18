'use client'

import { Dropzone, Field } from '@cognitap/radiant'

export function AttachScreenshots() {
  return (
    <Field
      label="Screenshots"
      className="w-full max-w-sm"
    >
      <Dropzone
        accept="image/*"
        multiple
        maxFiles={3}
        maxSize={5_000_000}
        description="Up to three images, 5 MB each."
      />
    </Field>
  )
}
