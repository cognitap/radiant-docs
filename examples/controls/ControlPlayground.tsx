'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type ControlSize } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { SelectControl } from '@/components/demo/ActionControls'

const FieldExample = dynamic(() => import('./FieldExample').then(module => module.FieldExample))
const InputExample = dynamic(() => import('./InputExample').then(module => module.InputExample))
const CheckboxExample = dynamic(() =>
  import('./CheckboxExample').then(module => module.CheckboxExample)
)
const CheckboxSelectionExample = dynamic(() =>
  import('./CheckboxSelectionExample').then(module => module.CheckboxSelectionExample)
)
const RadioGroupExample = dynamic(() =>
  import('./RadioGroupExample').then(module => module.RadioGroupExample)
)

export type ControlKind = 'field' | 'input' | 'checkbox' | 'selection' | 'radio'

export function ControlPlayground({ kind }: { kind: ControlKind }) {
  const [disabled, setDisabled] = useState(false)
  const [required, setRequired] = useState(kind !== 'checkbox')
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  const [native, setNative] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [initiallyEmpty, setInitiallyEmpty] = useState(false)
  const options = { disabled, required, controlSize }
  return (
    <>
      <DemoControls>
        <div className="action-options">
          {!(kind === 'field' && native) && (
            <SelectControl
              label="Control size"
              value={controlSize}
              options={['small', 'medium', 'large']}
              onChange={setControlSize}
            />
          )}
        </div>
        <div className="action-toggles">
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={event => setDisabled(event.target.checked)}
            />
            Disabled
          </label>
          {kind !== 'selection' && (
            <label>
              <input
                type="checkbox"
                checked={required}
                onChange={event => setRequired(event.target.checked)}
              />
              Required
            </label>
          )}
          {kind === 'field' && (
            <label>
              <input
                type="checkbox"
                checked={native}
                onChange={event => setNative(event.target.checked)}
              />
              Use native input
            </label>
          )}
          {kind === 'input' && (
            <label>
              <input
                type="checkbox"
                checked={readOnly}
                onChange={event => setReadOnly(event.target.checked)}
              />
              Read only
            </label>
          )}
          {kind === 'radio' && (
            <label>
              <input
                type="checkbox"
                checked={initiallyEmpty}
                onChange={event => setInitiallyEmpty(event.target.checked)}
              />
              Start with no selection
            </label>
          )}
        </div>
      </DemoControls>
      <DemoPreview>
        {kind === 'field' ? (
          <FieldExample
            key={String(native)}
            {...options}
            native={native}
          />
        ) : kind === 'input' ? (
          <InputExample
            {...options}
            readOnly={readOnly}
          />
        ) : kind === 'checkbox' ? (
          <CheckboxExample {...options} />
        ) : kind === 'selection' ? (
          <CheckboxSelectionExample {...options} />
        ) : (
          <RadioGroupExample
            key={String(initiallyEmpty)}
            {...options}
            initiallyEmpty={initiallyEmpty}
          />
        )}
      </DemoPreview>
    </>
  )
}
