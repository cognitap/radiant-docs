import { Demo } from './demo/Demo'
import { ButtonPlayground } from '@/examples/button/ButtonPlayground'
import { ButtonCompositionPlayground } from '@/examples/button/ButtonCompositionPlayground'

export function ButtonDemo({ disabled = false }: { disabled?: boolean }) {
  return (
    <Demo
      title={disabled ? 'Disabled Button' : 'Interactive Button'}
      files={['button/ButtonExample.tsx', 'button/button-example.css', 'profile/useHydrated.ts']}
    >
      <ButtonPlayground defaultDisabled={disabled} />
    </Demo>
  )
}

export function ButtonCompositionDemo() {
  return (
    <Demo
      title="Custom button and ref"
      files={[
        'button/ButtonComposition.tsx',
        'button/button-example.css',
        'profile/useHydrated.ts'
      ]}
    >
      <ButtonCompositionPlayground />
    </Demo>
  )
}
