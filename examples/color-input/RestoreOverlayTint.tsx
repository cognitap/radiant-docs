'use client'

import { useState } from 'react'
import { Button, ColorInput, Field } from '@cognitap/radiant'

const initial = 'rgb(34 94 110 / 0.6)'

export function RestoreOverlayTint() {
  const [value, setValue] = useState(initial)
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field label="Overlay tint">
        <ColorInput
          format="rgb"
          value={value}
          onValueChange={setValue}
        />
      </Field>
      <Button
        variant="outline"
        onClick={() => setValue(initial)}
      >
        Restore original tint
      </Button>
    </div>
  )
}
