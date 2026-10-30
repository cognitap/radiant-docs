'use client'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { FieldsetExample, type FieldsetTask } from './FieldsetExample'
export function FieldsetPlayground({ task = 'shipping' }: { task?: FieldsetTask }) {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <FieldsetExample task={task} />
      </DemoPreview>
    </>
  )
}
