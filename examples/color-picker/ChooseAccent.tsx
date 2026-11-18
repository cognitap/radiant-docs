'use client'

import { ColorPicker } from '@cognitap/radiant'

export function ChooseAccent() {
  return (
    <ColorPicker
      label="Accent color"
      defaultValue="#405CE0"
    />
  )
}
