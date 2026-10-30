'use client'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { AspectRatioExample, type AspectRatioTask } from './AspectRatioExample'
export function AspectRatioPlayground({ task = 'image' }: { task?: AspectRatioTask }) {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <AspectRatioExample task={task} />
      </DemoPreview>
    </>
  )
}
