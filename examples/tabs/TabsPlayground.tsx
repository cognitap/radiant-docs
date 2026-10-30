'use client'
import { useState } from 'react'
import type { ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TabsExample, type TabsTask } from './TabsExample'
export function TabsPlayground({ task = 'workspace' }: { task?: TabsTask }) {
  const [controlSize, setControlSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr')
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
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <TabsExample
          task={task}
          controlSize={controlSize}
          dir={dir}
        />
      </DemoPreview>
    </>
  )
}
