import { Demo } from './demo/Demo'
import { TablePlayground } from '@/examples/table/TablePlayground'
import { TableTaskPlayground } from '@/examples/table/TableTaskPlayground'
export function TableDemo() {
  return (
    <Demo
      title="Team directory"
      files={['table/TableExample.tsx']}
    >
      <TablePlayground />
    </Demo>
  )
}
export function TableTotalsDemo() {
  return (
    <Demo
      title="Total a budget"
      files={['table/TableTotalsExample.tsx']}
    >
      <TableTaskPlayground task="totals" />
    </Demo>
  )
}
export function TableWideDemo() {
  return (
    <Demo
      title="Scroll a wide report"
      files={['table/TableWideExample.tsx']}
    >
      <TableTaskPlayground task="wide" />
    </Demo>
  )
}
export function TableEmptyDemo() {
  return (
    <Demo
      title="Show an empty table"
      files={['table/TableEmptyExample.tsx']}
    >
      <TableTaskPlayground task="empty" />
    </Demo>
  )
}
