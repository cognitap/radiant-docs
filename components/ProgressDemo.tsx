import { Demo } from './demo/Demo'
import { ProgressPlayground } from '@/examples/progress/ProgressPlayground'
export function ProgressDemo() {
  return (
    <Demo
      title="Export progress"
      files={['progress/ProgressExample.tsx']}
    >
      <ProgressPlayground task="export" />
    </Demo>
  )
}
export function ProgressRecorderDemo() {
  return (
    <Demo
      title="Wait for a recorder"
      files={['progress/ProgressExample.tsx']}
    >
      <ProgressPlayground task="recorder" />
    </Demo>
  )
}
export function ProgressImportDemo() {
  return (
    <Demo
      title="Import a study in steps"
      files={['progress/ProgressExample.tsx']}
    >
      <ProgressPlayground task="import" />
    </Demo>
  )
}
export function ProgressUploadDemo() {
  return (
    <Demo
      title="Upload study files"
      files={['progress/ProgressExample.tsx']}
    >
      <ProgressPlayground task="upload" />
    </Demo>
  )
}
