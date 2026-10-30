import { Demo } from './demo/Demo'
import { TableExample } from '@/examples/table/TableExample'
export function TableDemo() {
  return (
    <Demo
      title="Team directory"
      files={['table/TableExample.tsx']}
    >
      <TableExample />
    </Demo>
  )
}
