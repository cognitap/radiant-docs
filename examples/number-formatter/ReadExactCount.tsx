'use client'
import { NumberFormatter } from '@cognitap/radiant'

export function ReadExactCount() {
  return (
    <p>
      Bytes processed{' '}
      <NumberFormatter
        value={98_765_432_101_234_567_890n}
        locale="en-US"
        className="tabular-nums [overflow-wrap:anywhere]"
      />
    </p>
  )
}
