'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { KbdExample, type KbdTask } from './KbdExample'
export function KbdPlayground({ task = 'find' }: { task?: KbdTask }) {
  const [modifier, setModifier] = useState<'Control' | 'Command'>('Control')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Modifier"
            value={modifier}
            options={['Control', 'Command']}
            onChange={setModifier}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <KbdExample
          task={task}
          modifier={modifier}
        />
      </DemoPreview>
    </>
  )
}
