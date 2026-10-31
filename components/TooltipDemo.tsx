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
export function TooltipToolbarDemo() {
  return (
    <Demo
      title="Describe icon buttons"
      files={['tooltip/TooltipExample.tsx']}
    >
      <TooltipPlayground task="toolbar" />
    </Demo>
  )
}
export function TooltipDelayDemo() {
  return (
    <Demo
      title="Open without a delay"
      files={['tooltip/TooltipExample.tsx']}
    >
      <TooltipPlayground task="delay" />
    </Demo>
  )
}
export function TooltipControlledDemo() {
  return (
    <Demo
      title="Show a tooltip from your own state"
      files={['tooltip/TooltipExample.tsx']}
    >
      <TooltipPlayground task="controlled" />
    </Demo>
  )
}
