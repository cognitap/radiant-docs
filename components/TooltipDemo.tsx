import { Demo } from './demo/Demo'
import { TooltipPlayground } from '@/examples/tooltip/TooltipPlayground'

export function TooltipDemo() {
  return (
    <Demo
      title="A little more context"
      files={['tooltip/TooltipExample.tsx']}
    >
      <TooltipPlayground />
    </Demo>
  )
}
