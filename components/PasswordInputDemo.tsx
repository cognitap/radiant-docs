import { Demo } from './demo/Demo'
import { PasswordInputPlayground } from '@/examples/passwordinput/PasswordInputPlayground'
export function PasswordInputDemo() {
  return (
    <Demo
      title="Prepare workspace sign in"
      files={['passwordinput/PasswordInputExample.tsx']}
    >
      <PasswordInputPlayground task="signin" />
    </Demo>
  )
}
export function PasswordInputChangeDemo() {
  return (
    <Demo
      title="Choose a new password"
      files={['passwordinput/PasswordInputExample.tsx']}
    >
      <PasswordInputPlayground task="change" />
    </Demo>
  )
}
export function PasswordInputReviewDemo() {
  return (
    <Demo
      title="Review a connection password"
      files={['passwordinput/PasswordInputExample.tsx']}
    >
      <PasswordInputPlayground task="review" />
    </Demo>
  )
}
export function PasswordInputLengthDemo() {
  return (
    <Demo
      title="Check password length"
      files={['passwordinput/PasswordInputExample.tsx']}
    >
      <PasswordInputPlayground task="length" />
    </Demo>
  )
}
