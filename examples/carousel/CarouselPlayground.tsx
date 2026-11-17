'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import {
  ReviewStudyLibrary,
  PrepareStudyNotes,
  CompareResearchRounds,
  RotateStudyHighlights
} from './CarouselExample'
export function CarouselPlayground({
  task
}: {
  task: 'review' | 'notes' | 'compare' | 'highlights'
}) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [autoPlay, setAutoPlay] = useState(false)
  const Example =
    task === 'review'
      ? ReviewStudyLibrary
      : task === 'notes'
        ? PrepareStudyNotes
        : task === 'compare'
          ? CompareResearchRounds
          : RotateStudyHighlights
  return (
    <>
      <DemoControls>
        <SelectControl
          label="Direction"
          value={dir}
          options={['ltr', 'rtl']}
          onChange={setDir}
        />
        <Checkbox
          label="Enable automatic rotation"
          checked={autoPlay}
          onChange={event => setAutoPlay(event.target.checked)}
        />
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
