import { Demo } from './demo/Demo'
import { TablePlayground } from '@/examples/table/TablePlayground'
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
