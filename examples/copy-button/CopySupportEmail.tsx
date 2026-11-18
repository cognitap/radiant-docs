'use client'

import { CopyButton } from '@cognitap/radiant'

export function CopySupportEmail() {
  const email = 'help@example.com'
  return (
    <div className="grid justify-items-start gap-2">
      <span className="text-sm">{email}</span>
      <CopyButton
        value={email}
        variant="ghost"
        errorText="Clipboard unavailable. Select the address to copy it."
      >
        Copy support email
      </CopyButton>
    </div>
  )
}
