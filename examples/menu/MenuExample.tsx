'use client'
import { useState } from 'react'
import { Menu, MenuTrigger, MenuPortal, MenuContent, MenuItem } from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
export function MenuExample() {
  const [copies, setCopies] = useState(0)
  const [archived, setArchived] = useState(false)
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <p>Studio notes · local draft</p>
          <Menu>
            <MenuTrigger variant="outline">Draft commands</MenuTrigger>
            <MenuPortal>
              <MenuContent>
                <MenuItem onSelect={() => setCopies(value => value + 1)}>Duplicate draft</MenuItem>
                <MenuItem disabled>Publish · owner only</MenuItem>
                <MenuItem onSelect={() => setArchived(value => !value)}>
                  {archived ? 'Restore draft' : 'Archive draft'}
                </MenuItem>
              </MenuContent>
            </MenuPortal>
          </Menu>
          <output>
            {archived ? 'Archived' : 'Active'} · {copies} local {copies === 1 ? 'copy' : 'copies'}
          </output>
        </div>
      </DemoPreview>
    </>
  )
}
