'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ToastExample, type ToastTask } from './ToastExample'
export function ToastPlayground({ task = 'sync' }: { task?: ToastTask }) {
  const [motion, setMotion] = useState<'inherit' | 'off'>('inherit')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Motion"
            value={motion}
            options={['inherit', 'off']}
            onChange={setMotion}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <ToastExample
          task={task}
          motion={motion}
        />
      </DemoPreview>
    </>
  )
}
