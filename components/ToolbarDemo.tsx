import { Demo } from './demo/Demo'
import { ToolbarPlayground } from '@/examples/toolbar/ToolbarPlayground'
export function ToolbarDemo() {
  return (
    <Demo
      title="Edit a document"
      files={['toolbar/ToolbarExample.tsx']}
    >
      <ToolbarPlayground task="editor" />
    </Demo>
  )
}
export function ToolbarDocumentsDemo() {
  return (
    <Demo
      title="Manage document actions"
      files={['toolbar/ToolbarExample.tsx']}
    >
      <ToolbarPlayground task="documents" />
    </Demo>
  )
}
export function ToolbarResourcesDemo() {
  return (
    <Demo
      title="Open project resources"
      files={['toolbar/ToolbarExample.tsx']}
    >
      <ToolbarPlayground task="resources" />
    </Demo>
  )
}
export function ToolbarCanvasDemo() {
  return (
    <Demo
      title="Choose canvas tools"
      files={['toolbar/ToolbarExample.tsx']}
    >
      <ToolbarPlayground task="canvas" />
    </Demo>
  )
}
