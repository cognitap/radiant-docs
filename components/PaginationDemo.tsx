import { Demo } from './demo/Demo'
import { PaginationExample } from '@/examples/pagination/PaginationExample'
export function PaginationDemo() {
  return (
    <Demo
      title="Local record pages"
      files={['pagination/PaginationExample.tsx']}
    >
      <PaginationExample />
    </Demo>
  )
}
