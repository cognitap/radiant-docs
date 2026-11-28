import { PasswordInputExample } from '@/examples/passwordinput/PasswordInputExample'
import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'

export function PasswordInputDemo() {
  return (
    <Demo
      title="Show and hide a password"
      files={['passwordinput/PasswordInputExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PasswordInputExample />
      </DemoPreview>
    </Demo>
  )
}
