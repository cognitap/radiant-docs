import { Demo } from './demo/Demo'
import { BreadcrumbExample } from '@/examples/breadcrumb/BreadcrumbExample'
export function BreadcrumbDemo() {
  return (
    <Demo
      title="Location hierarchy"
      files={['breadcrumb/BreadcrumbExample.tsx']}
    >
      <BreadcrumbExample />
    </Demo>
  )
}
