'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { ControlSize } from '@cognitap/radiant'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview, usePreviewTheme } from '@/components/demo/DemoFrame'
import { ChooseNotificationChannels, RequireConsent } from './CheckboxExample'

const Permissions = dynamic(() =>
  import('./CheckboxPermissions').then(module => module.CheckboxPermissionsExample)
)

export type CheckboxTask = 'channels' | 'permissions' | 'consent'

export function CheckboxPlayground({ task = 'channels' }: { task?: CheckboxTask }) {
  const { theme } = usePreviewTheme()
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
        {task === 'permissions' ? (
          <Permissions
            controlSize={controlSize}
            theme={theme}
          />
        ) : task === 'consent' ? (
          <RequireConsent controlSize={controlSize} />
        ) : (
          <ChooseNotificationChannels controlSize={controlSize} />
        )}
      </DemoPreview>
    </>
  )
}
