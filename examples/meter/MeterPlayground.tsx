'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { MeterExample, type MeterTask } from './MeterExample'
export function MeterPlayground({ task = 'storage' }: { task?: MeterTask }) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [height, setHeight] = useState<'standard' | 'large'>('standard')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Gauge height"
            value={height}
            options={['standard', 'large']}
            onChange={setHeight}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <MeterExample
          task={task}
          dir={dir}
          style={height === 'large' ? { '--rad-meter-height': '1rem' } : undefined}
        />
      </DemoPreview>
    </>
  )
}
