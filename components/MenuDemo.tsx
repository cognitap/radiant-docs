import { Demo } from './demo/Demo'
import { MenuExample } from '@/examples/menu/MenuExample'
export function MenuDemo() {
  return (
    <Demo
      title="Project commands"
      files={['menu/MenuExample.tsx']}
    >
      <MenuExample />
    </Demo>
  )
}
