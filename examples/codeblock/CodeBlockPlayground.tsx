'use client'
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
          <label>
            <input
              type="checkbox"
              checked={numbers}
              onChange={e => setNumbers(e.target.checked)}
            />
            Line numbers
          </label>
          <label>
            <input
              type="checkbox"
              checked={disabled}
              onChange={e => setDisabled(e.target.checked)}
            />
            Disable copying
          </label>
          {task === 'configuration' ? (
            <label>
              <input
                type="checkbox"
                checked={highlight}
                onChange={e => setHighlight(e.target.checked)}
              />
              Highlight quoted strings
            </label>
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
