'use client'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { SparklineExample } from './SparklineExample'
export function SparklinePlayground() {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <SparklineExample />
      </DemoPreview>
    </>
  )
}
