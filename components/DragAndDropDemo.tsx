import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { PlanTheWeek, SortFiles, SubmitSeating } from '@/examples/drag-and-drop/DragAndDropExample'
export function PlanTheWeekDemo() {
  return (
    <Demo
      title="Plan the week on a task board"
      files={['drag-and-drop/DragAndDropExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PlanTheWeek />
      </DemoPreview>
    </Demo>
  )
}
export function SortFilesDemo() {
  return (
    <Demo
      title="Sort files into folders"
      files={['drag-and-drop/DragAndDropExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <SortFiles />
      </DemoPreview>
    </Demo>
  )
}
export function SubmitSeatingDemo() {
  return (
    <Demo
      title="Submit a seating plan"
      files={['drag-and-drop/DragAndDropExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <SubmitSeating />
      </DemoPreview>
    </Demo>
  )
}
