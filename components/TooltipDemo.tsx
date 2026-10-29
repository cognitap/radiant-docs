import { Demo } from './demo/Demo'
import { TooltipExample } from '@/examples/tooltip/TooltipExample'

export function TooltipDemo() {
  return (
    <Demo
      title="A little more context"
      files={['tooltip/TooltipExample.tsx']}
    >
      <TooltipExample />
    </Demo>
  )
}
