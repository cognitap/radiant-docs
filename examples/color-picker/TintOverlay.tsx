'use client'

import { useState } from 'react'
import { ColorPicker } from '@cognitap/radiant'

export function TintOverlay() {
  const [value, setValue] = useState('rgb(45 62 115 / 0.6)')
  return (
    <div className="grid w-full max-w-xs gap-3">
      <div
        aria-hidden="true"
        className="h-12 rounded-[var(--rad-surface-radius)] bg-[var(--rad-color-neutral)]"
      >
        <div
          className="h-full rounded-[inherit]"
          style={{ background: value }}
        />
      </div>
      <ColorPicker
        label="Map overlay"
        format="rgb"
        value={value}
        onValueChange={setValue}
        eyedropper
      />
    </div>
  )
}
