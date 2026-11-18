'use client'
import { useState } from 'react'
import { Tree } from '@cognitap/radiant'

const files = [
  {
    value: 'reports',
    label: 'Reports',
    children: [
      { value: 'weekly', label: 'Weekly report' },
      { value: 'monthly', label: 'Monthly report' }
    ]
  }
]
export function ChooseExports() {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Tree
        aria-label="Files to export"
        items={files}
        type="multiple"
        checkboxes
        defaultExpanded={['reports']}
        value={selected}
        onValueChange={setSelected}
      />
      <output className="text-sm">{selected.length} selected</output>
    </div>
  )
}
