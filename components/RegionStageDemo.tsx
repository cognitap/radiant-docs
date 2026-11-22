import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { PickRoom, WatchSiteMap } from '@/examples/region-stage/RegionStageExample'
export function PickRoomDemo() {
  return (
    <Demo
      title="Pick a room on a floor plan"
      files={['region-stage/RegionStageExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PickRoom />
      </DemoPreview>
    </Demo>
  )
}
export function WatchSiteMapDemo() {
  return (
    <Demo
      title="Watch zones on a site map"
      files={['region-stage/RegionStageExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <WatchSiteMap />
      </DemoPreview>
    </Demo>
  )
}
