'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { ReviewStudyLibrary, PrepareStudyNotes, CompareResearchRounds } from './CarouselExample'
export function CarouselPlayground({ task }: { task: 'review' | 'notes' | 'compare' }) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [autoPlay, setAutoPlay] = useState(false)
  const Example =
    task === 'review'
      ? ReviewStudyLibrary
      : task === 'notes'
        ? PrepareStudyNotes
        : CompareResearchRounds
  return (
    <>
      <DemoControls>
        <SelectControl
          label="Direction"
          value={dir}
          options={['ltr', 'rtl']}
          onChange={setDir}
        />
        <label>
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={event => setAutoPlay(event.target.checked)}
          />
          Enable automatic rotation
        </label>
      </DemoControls>
      <DemoPreview>
        <Example
          dir={dir}
          autoPlay={autoPlay}
        />
      </DemoPreview>
    </>
  )
}
