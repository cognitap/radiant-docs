'use client'
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
        <label>
          <input
            type="checkbox"
            checked={narrow}
            onChange={event => setNarrow(event.target.checked)}
          />
          Narrow application
        </label>
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
