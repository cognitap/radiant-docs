'use client'
import { Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import { TableEmptyExample } from './TableEmptyExample'
import { TableTotalsExample } from './TableTotalsExample'
import { TableWideExample } from './TableWideExample'
const invites = [
  { email: 'ana@example.com', role: 'Editor', sent: 'Today' },
  { email: 'kofi@example.com', role: 'Viewer', sent: 'Yesterday' }
]
export type TableTask = 'totals' | 'wide' | 'empty'
export function TableTaskPlayground({ task }: { task: TableTask }) {
  const [empty, setEmpty] = useState(true)
  return (
    <>
      <DemoControls>
        {task === 'empty' && (
          <Checkbox
            label="No invites"
            checked={empty}
            onChange={event => setEmpty(event.target.checked)}
          />
        )}
      </DemoControls>
      <DemoPreview>
        {task === 'totals' && <TableTotalsExample />}
        {task === 'wide' && <TableWideExample />}
        {task === 'empty' && <TableEmptyExample invites={empty ? [] : invites} />}
      </DemoPreview>
    </>
  )
}
