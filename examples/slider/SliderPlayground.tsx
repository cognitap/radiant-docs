'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { SliderExample, type SliderTask } from './SliderExample'
import type { ControlSize } from '@cognitap/radiant'
export function SliderPlayground({ task = 'preferences' }: { task?: SliderTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={size}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <SliderExample
          task={task}
          controlSize={size}
          dir={dir}
        />
      </DemoPreview>
    </>
  )
}
