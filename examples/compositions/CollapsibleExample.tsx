'use client'

import { useState } from 'react'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  Input
} from '@cognitap/radiant'
import type { CompositionOptions } from './composition-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './composition-example.css'

export function CollapsibleExample({
  compact = false,
  controlled = false
}: CompositionOptions & { controlled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('Details are collapsed.')
  const ready = useHydrated()
  function change(next: boolean) {
    setOpen(next)
    setFeedback(next ? 'Details expanded.' : 'Details collapsed.')
  }
  const owner = controlled ? { open } : { defaultOpen: false }
  return (
    <div
      className="composition-example"
      data-hydrated={ready}
    >
      <div className="composition-stack">
        <Collapsible
          {...owner}
          onOpenChange={change}
          style={compact ? { '--rad-collapsible-padding': '1rem' } : undefined}
        >
          <CollapsibleTrigger>Reading notes</CollapsibleTrigger>
          <CollapsibleContent>
            <Field
              label="Draft note"
              description="Your draft stays mounted when this section is collapsed."
            >
              <Input defaultValue="" />
            </Field>
          </CollapsibleContent>
        </Collapsible>
        {controlled && (
          <div className="composition-actions">
            <Button
              variant="outline"
              onClick={() => change(!open)}
            >
              Toggle from outside
            </Button>
          </div>
        )}
        <output className="composition-result">{feedback}</output>
      </div>
    </div>
  )
}
