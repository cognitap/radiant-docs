import { Demo } from './demo/Demo'
import { PopoverPlayground } from '@/examples/popover/PopoverPlayground'
export function PopoverDemo() {
  return (
    <Demo
      title="Check delivery details"
      files={['popover/PopoverExample.tsx']}
    >
      <PopoverPlayground task="delivery" />
    </Demo>
  )
}
export function PopoverEditDemo() {
  return (
    <Demo
      title="Edit a delivery time"
      files={['popover/PopoverExample.tsx']}
    >
      <PopoverPlayground task="edit" />
    </Demo>
  )
}
export function PopoverControlledDemo() {
  return (
    <Demo
      title="Keep a breakdown open"
      files={['popover/PopoverExample.tsx']}
    >
      <PopoverPlayground task="controlled" />
    </Demo>
  )
}
export function PopoverPlacementDemo() {
  return (
    <Demo
      title="Place content above the trigger"
      files={['popover/PopoverExample.tsx']}
    >
      <PopoverPlayground task="placement" />
    </Demo>
  )
}
