'use client'

import { useState } from 'react'
import type { ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { InputExample } from './InputExample'

export function InputPlayground() {
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
        <InputExample controlSize={controlSize} />
      </DemoPreview>
    </>
  )
}
