import { Demo } from './demo/Demo'
import { OTPFieldPlayground } from '@/examples/otpfield/OTPFieldPlayground'
export function OTPFieldDemo() {
  return (
    <Demo
      title="Verify an email code"
      files={['otpfield/OTPFieldExample.tsx']}
    >
      <OTPFieldPlayground task="email" />
    </Demo>
  )
}
export function OTPFieldAccessDemo() {
  return (
    <Demo
      title="Approve temporary workspace access"
      files={['otpfield/OTPFieldExample.tsx']}
    >
      <OTPFieldPlayground task="access" />
    </Demo>
  )
}
export function OTPFieldRecoveryDemo() {
  return (
    <Demo
      title="Review an account recovery code"
      files={['otpfield/OTPFieldExample.tsx']}
    >
      <OTPFieldPlayground task="recovery" />
    </Demo>
  )
}
