'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { FindProjectWithAddons } from './InputAddonExample'
import type { ControlSize } from '@cognitap/radiant'
export function InputAddonPlayground() {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [modifier, setModifier] = useState<'Control' | 'Command'>('Control'),
    [disabled, setDisabled] = useState(false),
    [readOnly, setReadOnly] = useState(false),
    [invalid, setInvalid] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={size}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Modifier"
            value={modifier}
            options={['Control', 'Command']}
            onChange={setModifier}
          />
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Disabled control"
            checked={disabled}
            onChange={event => setDisabled(event.target.checked)}
          />
          <Checkbox
            label="Read only"
            checked={readOnly}
            onChange={event => setReadOnly(event.target.checked)}
          />
          <Checkbox
            label="Invalid control"
            checked={invalid}
            onChange={event => setInvalid(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <FindProjectWithAddons
          controlSize={size}
          dir={dir}
          modifier={modifier}
          disabled={disabled}
          readOnly={readOnly}
          invalid={invalid}
        />
      </DemoPreview>
    </>
  )
}
