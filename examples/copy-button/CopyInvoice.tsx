'use client'

import { CopyButton, InlineCode } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'

const invoice = 'INV-2408'

export function CopyInvoice() {
  return (
    <MotionProvider>
      <div
        className="relative grid justify-items-start gap-2"
        style={{
          width: '16rem',
          maxWidth: '100%',
          gridTemplateRows: 'auto auto minmax(2lh, auto)'
        }}
      >
        <InlineCode>{invoice}</InlineCode>
        <CopyButton
          value={invoice}
          copiedText="Invoice number copied"
          errorText="Could not copy. Select the number to copy it."
        >
          Copy invoice number
        </CopyButton>
      </div>
    </MotionProvider>
  )
}
