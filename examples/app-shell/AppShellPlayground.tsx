'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import {
  ReviewResearchSessions,
  WriteResearchNotes,
  RestoreResearchLayout
} from './AppShellExample'
export function AppShellPlayground({ task }: { task: 'sessions' | 'notes' | 'saved' }) {
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [motion, setMotion] = useState<'inherit' | 'off'>('inherit'),
    [narrow, setNarrow] = useState(task === 'notes')
  const Example =
    task === 'sessions'
      ? ReviewResearchSessions
      : task === 'notes'
        ? WriteResearchNotes
        : RestoreResearchLayout
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
          <SelectControl
            label="Motion"
            value={motion}
            options={['inherit', 'off']}
            onChange={setMotion}
          />
        </div>
        <Checkbox
          label="Narrow application"
          checked={narrow}
          onChange={event => setNarrow(event.target.checked)}
        />
      </DemoControls>
      <DemoPreview>
        <Example
          dir={dir}
          motion={motion}
          narrow={narrow}
        />
      </DemoPreview>
    </>
  )
}
