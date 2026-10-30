'use client'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ScrollAreaExample, type ScrollAreaTask } from './ScrollAreaExample'
export function ScrollAreaPlayground({ task = 'activity' }: { task?: ScrollAreaTask }) {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <ScrollAreaExample task={task} />
      </DemoPreview>
    </>
  )
}
