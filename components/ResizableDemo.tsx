import { Demo } from './demo/Demo'
import { ResizablePlayground } from '@/examples/resizable/ResizablePlayground'
export function ResizableDemo() {
  return (
    <Demo
      title="Review project documents"
      files={['resizable/ResizableExample.tsx']}
    >
      <ResizablePlayground task="files" />
    </Demo>
  )
}
export function ResizableNotesDemo() {
  return (
    <Demo
      title="Edit interview notes"
      files={['resizable/ResizableExample.tsx']}
    >
      <ResizablePlayground task="notes" />
    </Demo>
  )
}
export function ResizableSavedDemo() {
  return (
    <Demo
      title="Restore workspace layout"
      files={['resizable/ResizableExample.tsx']}
    >
      <ResizablePlayground task="saved" />
    </Demo>
  )
}
