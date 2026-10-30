import { Demo } from './demo/Demo'
import { KbdPlayground } from '@/examples/kbd/KbdPlayground'
export function KbdDemo() {
  return (
    <Demo
      title="Find a project"
      files={['kbd/KbdExample.tsx']}
    >
      <KbdPlayground task="find" />
    </Demo>
  )
}
export function KbdDuplicateDemo() {
  return (
    <Demo
      title="Duplicate a study note"
      files={['kbd/KbdExample.tsx']}
    >
      <KbdPlayground task="duplicate" />
    </Demo>
  )
}
export function KbdSaveDemo() {
  return (
    <Demo
      title="Save a study note"
      files={['kbd/KbdExample.tsx']}
    >
      <KbdPlayground task="save" />
    </Demo>
  )
}
