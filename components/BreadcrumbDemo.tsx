import { Demo } from './demo/Demo'
import { BreadcrumbPlayground } from '@/examples/breadcrumb/BreadcrumbPlayground'

const css = 'breadcrumb/breadcrumb-example.css'

export function BreadcrumbDemo() {
  return (
    <Demo
      title="Location hierarchy"
      files={['breadcrumb/BreadcrumbExample.tsx', css]}
    >
      <BreadcrumbPlayground />
    </Demo>
  )
}

export function BreadcrumbLongTrailDemo() {
  return (
    <Demo
      title="Wrap a long trail"
      files={['breadcrumb/LongTrailExample.tsx', css]}
    >
      <BreadcrumbPlayground task="long-trail" />
    </Demo>
  )
}

export function BreadcrumbRouterDemo() {
  return (
    <Demo
      title="Route with render"
      files={['breadcrumb/RouterBreadcrumbExample.tsx', css]}
    >
      <BreadcrumbPlayground task="router" />
    </Demo>
  )
}

export function BreadcrumbSeparatorDemo() {
  return (
    <Demo
      title="Use a custom separator"
      files={['breadcrumb/SeparatorExample.tsx', css]}
    >
      <BreadcrumbPlayground task="separator" />
    </Demo>
  )
}
