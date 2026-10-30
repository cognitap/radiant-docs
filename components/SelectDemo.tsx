import { Demo } from './demo/Demo'
import {
  SelectCitiesExample,
  SelectControlledExample,
  SelectDialogExample,
  SelectSettingsExample,
  SelectStatesExample
} from '@/examples/select/SelectExamples'

const files = ['select/SelectExamples.tsx']

export function SelectDemo() {
  return (
    <Demo
      title="Your workspace"
      files={files}
    >
      <SelectSettingsExample />
    </Demo>
  )
}
export function SelectControlledDemo() {
  return (
    <Demo
      title="Approve each change"
      files={files}
    >
      <SelectControlledExample />
    </Demo>
  )
}
export function SelectCitiesDemo() {
  return (
    <Demo
      title="Jump through a grouped list"
      files={files}
    >
      <SelectCitiesExample />
    </Demo>
  )
}
export function SelectDialogDemo() {
  return (
    <Demo
      title="Pick inside a dialog"
      files={files}
    >
      <SelectDialogExample />
    </Demo>
  )
}
export function SelectStatesDemo() {
  return (
    <Demo
      title="Lock or flag a choice"
      files={files}
    >
      <SelectStatesExample />
    </Demo>
  )
}
