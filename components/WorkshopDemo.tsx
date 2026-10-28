import { resolve } from 'node:path'
import { exampleSources } from '@/lib/demo-sources.mjs'
import { Demo } from './demo/Demo'
import { ThemeWorkshop } from '@/examples/workshop/ThemeWorkshop'

export async function WorkshopDemo() {
  return (
    <Demo
      title="Shared theme workshop"
      reset={false}
      files={await exampleSources(resolve('examples'), 'workshop')}
    >
      <ThemeWorkshop />
    </Demo>
  )
}
