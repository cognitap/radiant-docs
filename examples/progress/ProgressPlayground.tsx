'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ProgressExample } from './ProgressExample'

export function ProgressPlayground() {
  const [value, setValue] = useState(0)
  const [unknown, setUnknown] = useState(false)
  const complete = !unknown && value === 100

  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={unknown}
            onChange={event => setUnknown(event.target.checked)}
          />{' '}
          Unknown remaining amount
        </label>
        <button
          type="button"
          disabled={complete || unknown}
          onClick={() => setValue(number => Math.min(100, number + 25))}
        >
          Advance export
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(0)
            setUnknown(false)
          }}
        >
          Reset export
        </button>
      </DemoControls>
      <DemoPreview>
        <ProgressExample
          value={value}
          unknown={unknown}
        />
      </DemoPreview>
    </>
  )
}
