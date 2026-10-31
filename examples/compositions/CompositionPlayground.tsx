'use client'

import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { SelectControl } from '@/components/demo/ActionControls'

const DialogExample = dynamic(() => import('./DialogExample').then(module => module.DialogExample))
const CollapsibleExample = dynamic(() =>
  import('./CollapsibleExample').then(module => module.CollapsibleExample)
)
const AccordionExample = dynamic(() =>
  import('./AccordionExample').then(module => module.AccordionExample)
)
const CardExample = dynamic(() => import('./CardExample').then(module => module.CardExample))

export type CompositionKind = 'dialog' | 'collapsible' | 'accordion' | 'card'

export function CompositionPlayground({
  kind,
  defaultControlled = false
}: {
  kind: CompositionKind
  defaultControlled?: boolean
}) {
  const [compact, setCompact] = useState(false)
  const [ownership, setOwnership] = useState<'uncontrolled' | 'controlled'>(
    defaultControlled ? 'controlled' : 'uncontrolled'
  )
  const [selection, setSelection] = useState<'single' | 'multiple'>('single')
  const [disabled, setDisabled] = useState(false)
  const [modal, setModal] = useState(true)
  const [closeOnEscape, setCloseOnEscape] = useState(true)
  const [closeOnBackdrop, setCloseOnBackdrop] = useState(true)
  const controlled = ownership === 'controlled'
  const options = { compact }
  return (
    <>
      <DemoControls>
        <div className="action-options">
          {kind !== 'card' && (
            <SelectControl
              label="State owner"
              value={ownership}
              options={['uncontrolled', 'controlled']}
              onChange={setOwnership}
            />
          )}
          {kind === 'accordion' && (
            <SelectControl
              label="Selection"
              value={selection}
              options={['single', 'multiple']}
              onChange={setSelection}
            />
          )}
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Compact"
            checked={compact}
            onChange={event => setCompact(event.target.checked)}
          />
          {kind === 'dialog' && (
            <>
              <Checkbox
                label="Modal"
                checked={modal}
                onChange={event => setModal(event.target.checked)}
              />
              <Checkbox
                label="Close on Escape"
                checked={closeOnEscape}
                onChange={event => setCloseOnEscape(event.target.checked)}
              />
              <Checkbox
                label="Close on backdrop"
                checked={closeOnBackdrop}
                onChange={event => setCloseOnBackdrop(event.target.checked)}
              />
            </>
          )}
          {kind === 'accordion' && (
            <Checkbox
              label="Disabled"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
          )}
        </div>
      </DemoControls>
      <DemoPreview>
        {kind === 'dialog' ? (
          <DialogExample
            key={ownership}
            {...options}
            controlled={controlled}
            modal={modal}
            closeOnEscape={closeOnEscape}
            closeOnBackdrop={closeOnBackdrop}
          />
        ) : kind === 'collapsible' ? (
          <CollapsibleExample
            key={ownership}
            {...options}
            controlled={controlled}
          />
        ) : kind === 'accordion' ? (
          <AccordionExample
            key={`${ownership}:${selection}`}
            {...options}
            controlled={controlled}
            multiple={selection === 'multiple'}
            disabled={disabled}
          />
        ) : (
          <CardExample {...options} />
        )}
      </DemoPreview>
    </>
  )
}
