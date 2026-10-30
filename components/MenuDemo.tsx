import { Demo } from './demo/Demo'
import { MenuPlayground } from '@/examples/menu/MenuPlayground'
export function MenuDemo() {
  return (
    <Demo
      title="Project commands"
      files={['menu/MenuExample.tsx']}
    >
      <MenuPlayground />
    </Demo>
  )
}
