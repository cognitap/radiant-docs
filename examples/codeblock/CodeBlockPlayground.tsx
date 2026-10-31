'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { CodeBlockExample, type CodeBlockTask } from './CodeBlockExample'
import type { ControlSize } from '@cognitap/radiant'
export function CodeBlockPlayground({ task = 'install' }: { task?: CodeBlockTask }) {
  const [size, setSize] = useState<ControlSize>('medium'),
    [dir, setDir] = useState<'ltr' | 'rtl'>('ltr'),
    [numbers, setNumbers] = useState(task === 'export'),
    [highlight, setHighlight] = useState(true),
    [disabled, setDisabled] = useState(false)
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Control size"
            value={size}
            options={['small', 'medium', 'large']}
            onChange={setSize}
          />
          <SelectControl
            label="Direction"
            value={dir}
            options={['ltr', 'rtl']}
            onChange={setDir}
          />
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Line numbers"
            checked={numbers}
            onChange={e => setNumbers(e.target.checked)}
          />
          <Checkbox
            label="Disable copying"
            checked={disabled}
            onChange={e => setDisabled(e.target.checked)}
          />
          {task === 'configuration' ? (
            <Checkbox
              label="Highlight quoted strings"
              checked={highlight}
              onChange={e => setHighlight(e.target.checked)}
            />
          ) : null}
        </div>
      </DemoControls>
      <DemoPreview>
        <CodeBlockExample
          task={task}
          controlSize={size}
          dir={dir}
          lineNumbers={numbers}
          highlight={highlight}
          disabled={disabled}
        />
      </DemoPreview>
    </>
  )
}
