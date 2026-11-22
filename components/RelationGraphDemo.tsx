import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import {
  ShowOrgChart,
  ShowDependencies,
  PickState
} from '@/examples/relation-graph/RelationGraphExample'
export function ShowOrgChartDemo() {
  return (
    <Demo
      title="Show an org chart"
      files={['relation-graph/RelationGraphExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ShowOrgChart />
      </DemoPreview>
    </Demo>
  )
}
export function ShowDependenciesDemo() {
  return (
    <Demo
      title="Show service dependencies"
      files={['relation-graph/RelationGraphExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ShowDependencies />
      </DemoPreview>
    </Demo>
  )
}
export function PickStateDemo() {
  return (
    <Demo
      title="Pick a state in a state machine"
      files={['relation-graph/RelationGraphExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PickState />
      </DemoPreview>
    </Demo>
  )
}
