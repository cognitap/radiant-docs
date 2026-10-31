import { Demo } from './demo/Demo'
import { CodeBlockPlayground } from '@/examples/codeblock/CodeBlockPlayground'
export function CodeBlockDemo() {
  return (
    <Demo
      title="Install Radiant"
      files={['codeblock/CodeBlockExample.tsx']}
    >
      <CodeBlockPlayground task="install" />
    </Demo>
  )
}
export function CodeBlockConfigurationDemo() {
  return (
    <Demo
      title="Generate export configuration"
      files={['codeblock/CodeBlockExample.tsx']}
    >
      <CodeBlockPlayground task="configuration" />
    </Demo>
  )
}
export function CodeBlockExportDemo() {
  return (
    <Demo
      title="Inspect session export"
      files={['codeblock/CodeBlockExample.tsx']}
    >
      <CodeBlockPlayground task="export" />
    </Demo>
  )
}
