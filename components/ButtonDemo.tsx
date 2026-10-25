import { Demo } from './demo/Demo'
import { ButtonPlayground } from '@/examples/button/ButtonPlayground'

export function ButtonDemo({ disabled = false }: { disabled?: boolean }) {
  return (
    <Demo
      title={disabled ? 'Disabled Button' : 'Interactive Button'}
      files={['button/ButtonExample.tsx', 'button/button-example.css']}
    >
      <ButtonPlayground defaultDisabled={disabled} />
    </Demo>
  )
}
