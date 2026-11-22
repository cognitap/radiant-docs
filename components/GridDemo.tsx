import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { GridExample } from '@/examples/grid/GridExample'
export function GridDemo() {
  return (
    <Demo
      title="List courses"
      files={['grid/GridExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <GridExample />
      </DemoPreview>
    </Demo>
  )
}
