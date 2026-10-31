'use client'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { EditorActions, ReleaseNotes, SettingsSections } from './SeparatorExample'
export type SeparatorTask = 'sections' | 'actions' | 'heading'
export function SeparatorPlayground({ task = 'sections' }: { task?: SeparatorTask }) {
  const [thickness, setThickness] = useState<'1px' | '2px' | '4px'>('1px'),
    [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid'),
    options = {
      style: { '--rad-separator-thickness': thickness, '--rad-separator-style': lineStyle }
    }
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Thickness"
            value={thickness}
            options={['1px', '2px', '4px']}
            onChange={setThickness}
          />
          <SelectControl
            label="Line style"
            value={lineStyle}
            options={['solid', 'dashed', 'dotted']}
            onChange={setLineStyle}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        {task === 'actions' ? (
          <EditorActions {...options} />
        ) : task === 'heading' ? (
          <ReleaseNotes {...options} />
        ) : (
          <SettingsSections {...options} />
        )}
      </DemoPreview>
    </>
  )
}
