'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { type LinkVariant, type Tone, type ControlSize } from '@cognitap/radiant'
import type { LinkTask } from './LinkExample'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const LinkExample = dynamic(() => import('./LinkExample').then(module => module.LinkExample))

export function LinkPlayground({ task = 'guide' }: { task?: LinkTask }) {
  const prose = task === 'prose'
  const [variant, setVariant] = useState<LinkVariant>('inline')
  const [tone, setTone] = useState<Tone>('accent')
  const [controlSize, setControlSize] = useState<ControlSize>('medium')
  const [external, setExternal] = useState(false)

  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Variant"
            value={variant}
            options={
              prose
                ? ['inline', 'subtle']
                : ['inline', 'subtle', 'solid', 'soft', 'outline', 'ghost']
            }
            onChange={setVariant}
          />
          <SelectControl
            label="Tone"
            value={tone}
            options={['accent', 'neutral', 'warning', 'danger']}
            onChange={setTone}
          />
          {prose ? null : (
            <SelectControl
              label="Control size"
              value={controlSize}
              options={['small', 'medium', 'large']}
              onChange={setControlSize}
            />
          )}
        </div>
        {prose ? null : (
          <label>
            <input
              type="checkbox"
              checked={external}
              onChange={event => setExternal(event.target.checked)}
            />
            Open in a new tab
          </label>
        )}
      </DemoControls>
      <DemoPreview>
        <LinkExample
          task={task}
          variant={variant}
          tone={tone}
          controlSize={controlSize}
          external={external}
        />
      </DemoPreview>
    </>
  )
}
