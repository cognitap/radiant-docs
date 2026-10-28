import { DemoFrame } from './demo/DemoFrame'
import { ThemeWorkshop } from '@/examples/workshop/ThemeWorkshop'

export function WorkshopDemo() {
  return (
    <DemoFrame
      title="Shared theme workshop"
      reset={false}
      sources="/demo-sources/workshop.json"
    >
      <ThemeWorkshop />
    </DemoFrame>
  )
}
