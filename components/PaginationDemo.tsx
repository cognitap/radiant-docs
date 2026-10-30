import { Demo } from './demo/Demo'
import { PaginationPlayground } from '@/examples/pagination/PaginationPlayground'
export function PaginationDemo() {
  return (
    <Demo
      title="Local record pages"
      files={['pagination/PaginationExample.tsx']}
    >
      <PaginationPlayground />
    </Demo>
  )
}
