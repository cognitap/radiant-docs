'use client'

import { useState } from 'react'
import { Button, Separator, ToggleGroup, ToggleGroupItem, Toolbar } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'

export function ToolbarExample() {
  const [format, setFormat] = useState<string[]>([])

  return (
    <MotionProvider>
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '100%' }}>
        <Toolbar aria-label="Formatting">
          <Button
            variant="outline"
            disabled={format.length === 0}
            onClick={() => setFormat([])}
          >
            Clear
          </Button>
          <Separator
            decorative
            orientation="vertical"
          />
          <ToggleGroup
            aria-label="Text style"
            type="multiple"
            value={format}
            onValueChange={setFormat}
          >
            <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
            <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          </ToggleGroup>
        </Toolbar>
        <p
          style={{
            margin: 0,
            fontWeight: format.includes('bold') ? 700 : 400,
            fontStyle: format.includes('italic') ? 'italic' : 'normal'
          }}
        >
          Project notes
        </p>
      </div>
    </MotionProvider>
  )
}
