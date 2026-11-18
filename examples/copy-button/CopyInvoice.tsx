'use client'

import { CopyButton, InlineCode } from '@cognitap/radiant'

export function CopyInvoice() {
  return (
    <div className="grid justify-items-start gap-2">
      <InlineCode>INV-2408</InlineCode>
      <CopyButton
        value="INV-2408"
        resetDelay={4000}
        variant="outline"
        copiedText="Invoice number copied."
      >
        Copy invoice number
      </CopyButton>
    </div>
  )
}
