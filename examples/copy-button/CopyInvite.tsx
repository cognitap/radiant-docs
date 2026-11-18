'use client'

import { CopyButton } from '@cognitap/radiant'

const invite = 'https://example.com/invite/studio'

export function CopyInvite() {
  return (
    <div className="grid justify-items-start gap-2">
      <span className="text-sm [overflow-wrap:anywhere]">{invite}</span>
      <CopyButton
        value={invite}
        copiedText="Invitation link copied."
      >
        Copy invitation link
      </CopyButton>
    </div>
  )
}
