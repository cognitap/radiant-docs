import { Demo } from './demo/Demo'
import { InputGroupPlayground } from '@/examples/inputgroup/InputGroupPlayground'
export function InputGroupDemo() {
  return (
    <Demo
      title="Find a project"
      files={['inputgroup/InputGroupExample.tsx']}
    >
      <InputGroupPlayground task="find" />
    </Demo>
  )
}
export function InputGroupBudgetDemo() {
  return (
    <Demo
      title="Set a project budget"
      files={['inputgroup/InputGroupExample.tsx']}
    >
      <InputGroupPlayground task="budget" />
    </Demo>
  )
}
export function InputGroupUpdateDemo() {
  return (
    <Demo
      title="Post a study update"
      files={['inputgroup/InputGroupExample.tsx']}
    >
      <InputGroupPlayground task="update" />
    </Demo>
  )
}
