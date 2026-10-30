'use client'

import { useState } from 'react'
import type { ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { EmailTopics, FocusSettings } from './SwitchExample'
import { WorkspacePreferences } from './SwitchForm'

export type SwitchTask = 'focus' | 'topics' | 'form'

export function SwitchPlayground({ task = 'focus' }: { task?: SwitchTask }) {
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={controlSize}
            options={['small', 'medium', 'large']}
            onChange={setControlSize}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        {task === 'form' ? (
          <WorkspacePreferences controlSize={controlSize} />
        ) : task === 'topics' ? (
          <EmailTopics controlSize={controlSize} />
        ) : (
          <FocusSettings controlSize={controlSize} />
        )}
      </DemoPreview>
    </>
  )
}
