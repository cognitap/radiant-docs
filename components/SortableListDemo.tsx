import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import {
  RankPriorities,
  OrderPlaylist,
  SaveSearchOrder
} from '@/examples/sortable-list/SortableListExample'
export function RankPrioritiesDemo() {
  return (
    <Demo
      title="Rank weekly priorities"
      files={['sortable-list/SortableListExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <RankPriorities />
      </DemoPreview>
    </Demo>
  )
}
export function OrderPlaylistDemo() {
  return (
    <Demo
      title="Order a playlist"
      files={['sortable-list/SortableListExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <OrderPlaylist />
      </DemoPreview>
    </Demo>
  )
}
export function SaveSearchOrderDemo() {
  return (
    <Demo
      title="Submit a search order"
      files={['sortable-list/SortableListExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <SaveSearchOrder />
      </DemoPreview>
    </Demo>
  )
}
