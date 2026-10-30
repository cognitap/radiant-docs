'use client'

import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TooltipExample } from './TooltipExample'

export function TooltipPlayground() {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <TooltipExample />
      </DemoPreview>
    </>
  )
}
