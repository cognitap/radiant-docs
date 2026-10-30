'use client'

import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { MenuExample } from './MenuExample'

export function MenuPlayground() {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <MenuExample />
      </DemoPreview>
    </>
  )
}
