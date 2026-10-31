import { Demo } from './demo/Demo'
import { PaginationPlayground } from '@/examples/pagination/PaginationPlayground'
export function PaginationDemo() {
  return (
    <Demo
      title="Local record pages"
      files={['pagination/PaginationExample.tsx']}
    >
      <PaginationPlayground task="records" />
    </Demo>
  )
}
export function PaginationLinksDemo() {
  return (
    <Demo
      title="Link to server-rendered pages"
      files={['pagination/ResultPagesExample.tsx']}
    >
      <PaginationPlayground task="links" />
    </Demo>
  )
}
export function PaginationBoundariesDemo() {
  return (
    <Demo
      title="Show the first and last pages"
      files={['pagination/ResultPagesExample.tsx']}
    >
      <PaginationPlayground task="boundaries" />
    </Demo>
  )
}
