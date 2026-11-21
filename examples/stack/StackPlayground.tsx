'use client'
import {
  Checkbox,
  type Orientation,
  type Spacing,
  type StackAlign,
  type StackJustify
} from '@cognitap/radiant'
import { useState } from 'react'
import { SelectControl } from '@/components/demo/ActionControls'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { StackExample, type StackTask } from './StackExample'
export function StackPlayground({ task = 'actions' }: { task?: StackTask }) {
  const [orientation, setOrientation] = useState<Orientation>('vertical'),
    [gap, setGap] = useState<Spacing>('normal'),
    [align, setAlign] = useState<StackAlign>('stretch'),
    [justify, setJustify] = useState<StackJustify>('start'),
    [wrap, setWrap] = useState(false)
  if (task !== 'actions')
    return (
      <>
        <DemoControls />
        <DemoPreview>
          <StackExample task={task} />
        </DemoPreview>
      </>
    )
  return (
    <>
      <DemoControls>
        <div className="action-options">
          <SelectControl
            label="Direction"
            value={orientation}
            options={['vertical', 'horizontal']}
            onChange={setDirection}
          />
          <SelectControl
            label="Gap"
            value={gap}
            options={['tight', 'normal', 'airy']}
            onChange={setGap}
          />
          <SelectControl
            label="Align"
            value={align}
            options={['start', 'center', 'end', 'stretch']}
            onChange={setAlign}
          />
          <SelectControl
            label="Justify"
            value={justify}
            options={['start', 'center', 'end', 'between', 'around', 'evenly', 'stretch']}
            onChange={setJustify}
          />
        </div>
        <div className="action-toggles">
          <Checkbox
            label="Wrap"
            checked={wrap}
            onChange={event => setWrap(event.target.checked)}
          />
        </div>
      </DemoControls>
      <DemoPreview>
        <StackExample
          orientation={orientation}
          gap={gap}
          align={align}
          justify={justify}
          wrap={wrap}
        />
      </DemoPreview>
    </>
  )
}
