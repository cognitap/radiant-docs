'use client'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { CheckboxGroupExample, type CheckboxGroupTask } from './CheckboxGroupExample'
export function CheckboxGroupPlayground({ task = 'channels' }: { task?: CheckboxGroupTask }) {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <CheckboxGroupExample task={task} />
      </DemoPreview>
    </>
  )
}
