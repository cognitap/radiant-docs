import { Demo } from './demo/Demo'
import { CodeBlockPlayground } from '@/examples/codeblock/CodeBlockPlayground'

export function CodeBlockDemo() {
  return (
    <Demo
      title="Copy a snippet"
      files={['codeblock/CodeBlockExample.tsx']}
    >
      <CodeBlockPlayground />
    </Demo>
  )
}
