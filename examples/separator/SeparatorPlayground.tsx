'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { SeparatorExample } from './SeparatorExample'

export function SeparatorPlayground() {
  const [decorative, setDecorative] = useState(false)
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')

  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={decorative}
            onChange={event => setDecorative(event.target.checked)}
          />{' '}
          Decorative division
        </label>
        <label>
          Orientation{' '}
          <select
            value={orientation}
            onChange={event =>
              setOrientation(event.target.value === 'vertical' ? 'vertical' : 'horizontal')
            }
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
      </DemoControls>
      <DemoPreview>
        <SeparatorExample
          decorative={decorative}
          orientation={orientation}
        />
      </DemoPreview>
    </>
  )
}
