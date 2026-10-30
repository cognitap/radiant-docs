import { Demo } from './demo/Demo'
import { MultiSelectPlayground } from '@/examples/multiselect/MultiSelectPlayground'
export function MultiSelectDemo() {
  return (
    <Demo
      title="Assign project reviewers"
      files={['multiselect/MultiSelectExample.tsx']}
    >
      <MultiSelectPlayground task="reviewers" />
    </Demo>
  )
}
export function MultiSelectBoardDemo() {
  return (
    <Demo
      title="Filter the release board"
      files={['multiselect/MultiSelectExample.tsx']}
    >
      <MultiSelectPlayground task="board" />
    </Demo>
  )
}
export function MultiSelectLeadDemo() {
  return (
    <Demo
      title="Keep the lead reviewer"
      files={['multiselect/MultiSelectExample.tsx']}
    >
      <MultiSelectPlayground task="lead" />
    </Demo>
  )
}
