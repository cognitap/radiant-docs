import { Demo } from './demo/Demo'
import { ButtonGroupPlayground } from '@/examples/buttongroup/ButtonGroupPlayground'
export function ButtonGroupDemo() {
  return (
    <Demo
      title="Edit project actions"
      files={['buttongroup/ButtonGroupExample.tsx']}
    >
      <ButtonGroupPlayground task="project" />
    </Demo>
  )
}
export function ButtonGroupPublishDemo() {
  return (
    <Demo
      title="Publish a report"
      files={['buttongroup/ButtonGroupExample.tsx']}
    >
      <ButtonGroupPlayground task="publish" />
    </Demo>
  )
}
export function ButtonGroupWeeksDemo() {
  return (
    <Demo
      title="Browse review weeks"
      files={['buttongroup/ButtonGroupExample.tsx']}
    >
      <ButtonGroupPlayground task="weeks" />
    </Demo>
  )
}
