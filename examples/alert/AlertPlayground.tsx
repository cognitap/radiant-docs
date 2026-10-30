'use client'

import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { AlertExample, type SaveResult } from './AlertExample'

export function AlertPlayground() {
  const [result, setResult] = useState<SaveResult>(null)
  const [urgent, setUrgent] = useState(false)

  return (
    <>
      <DemoControls>
        <button
          type="button"
          onClick={() => setResult('error')}
        >
          Simulate connection error
        </button>
        <button
          type="button"
          onClick={() => setUrgent(true)}
        >
          Simulate urgent interruption
        </button>
      </DemoControls>
      <DemoPreview>
        <AlertExample
          result={result}
          urgent={urgent}
          onResultChange={setResult}
        />
      </DemoPreview>
    </>
  )
}
