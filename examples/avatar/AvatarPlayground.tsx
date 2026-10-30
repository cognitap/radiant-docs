'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { AvatarExample, type AvatarSource } from './AvatarExample'

export function AvatarPlayground() {
  const [source, setSource] = useState<AvatarSource>('image')
  const [adjacent, setAdjacent] = useState(true)

  return (
    <>
      <DemoControls>
        <label>
          Image source{' '}
          <select
            value={source}
            onChange={event =>
              setSource(
                event.target.value === 'missing'
                  ? 'missing'
                  : event.target.value === 'fallback'
                    ? 'fallback'
                    : 'image'
              )
            }
          >
            <option value="image">Available image</option>
            <option value="missing">Unavailable image</option>
            <option value="fallback">No image</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={adjacent}
            onChange={event => setAdjacent(event.target.checked)}
          />{' '}
          Use adjacent name
        </label>
      </DemoControls>
      <DemoPreview>
        <AvatarExample
          source={source}
          adjacent={adjacent}
        />
      </DemoPreview>
    </>
  )
}
