'use client'

import { ColorPicker } from '@cognitap/radiant'

export function ChooseBrandSwatch() {
  return (
    <ColorPicker
      label="Brand accent"
      defaultValue="#405CE0"
      format="oklch"
      swatches={[
        { color: '#405CE0', label: 'Indigo' },
        { color: 'rgb(36 140 97)', label: 'Fern' },
        { color: 'oklch(69% 0.18 41)', label: 'Clay' }
      ]}
    />
  )
}
