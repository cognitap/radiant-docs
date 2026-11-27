'use client'

import { useState } from 'react'
import { Button, Field, InputGroup, InputGroupAddon, InputGroupInput } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function InputGroupExample() {
  const [amount, setAmount] = useState('250')
  const actionInset = 3

  return (
    <Field
      label="Amount (USD)"
      style={{ width: '100%', maxWidth: '24rem' }}
    >
      <InputGroup style={{ paddingInlineEnd: actionInset }}>
        <InputGroupAddon aria-hidden>$</InputGroupAddon>
        <InputGroupInput
          name="amount"
          inputMode="decimal"
          value={amount}
          onChange={event => setAmount(event.currentTarget.value)}
        />
        <InputGroupAddon style={{ alignSelf: 'stretch', marginBlock: actionInset }}>
          <Button
            variant="ghost"
            tone="neutral"
            controlSize="small"
            style={{ alignSelf: 'stretch', minHeight: 0 }}
            onClick={() => setAmount('')}
          >
            Clear
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
