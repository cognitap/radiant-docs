'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview, usePreviewTheme } from '@/components/demo/DemoFrame'

const FieldValidationExample = dynamic(() =>
  import('./FieldValidationExample').then(module => module.FieldValidationExample)
)

export function FieldPlayground() {
  const { theme } = usePreviewTheme()
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setControlSize}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <FieldValidationExample
          controlSize={controlSize}
          theme={theme}
        />
      </DemoPreview>
    </>
  )
}
