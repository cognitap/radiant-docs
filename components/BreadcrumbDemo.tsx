import { Demo } from './demo/Demo'
import { BreadcrumbPlayground } from '@/examples/breadcrumb/BreadcrumbPlayground'
export function BreadcrumbDemo() {
  return (
    <Demo
      title="Location hierarchy"
      files={['breadcrumb/BreadcrumbExample.tsx']}
    >
      <BreadcrumbPlayground />
    </Demo>
  )
}
