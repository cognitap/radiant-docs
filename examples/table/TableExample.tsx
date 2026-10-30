'use client'
import { useState } from 'react'
import {
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  TableHeader,
  TableCell,
  TableContainer,
  Link,
  Button,
  Badge
} from '@cognitap/radiant'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import '@cognitap/radiant/styles.css'
const members = [
  { name: 'Jordan Rivera', role: 'Designer' },
  { name: 'Sam Lee', role: 'Engineer' }
]
export function TableExample() {
  const [wide, setWide] = useState(false)
  const [selected, setSelected] = useState('None')
  return (
    <>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={wide}
            onChange={event => setWide(event.target.checked)}
          />{' '}
          Use wide columns
        </label>
      </DemoControls>
      <DemoPreview>
        <div style={{ width: '32rem', maxWidth: '100%' }}>
          <TableContainer aria-label="Scrollable team directory">
            <Table style={{ minWidth: wide ? '42rem' : undefined }}>
              <TableCaption>Team members</TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.name}>
                    <TableHeader scope="row">{member.name}</TableHeader>
                    <TableCell>
                      <Badge>{member.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        controlSize="small"
                        onClick={() => setSelected(member.name)}
                      >
                        Select {member.name.split(' ')[0]}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFoot>
                <TableRow>
                  <TableCell colSpan={3}>
                    {members.length} members · <Link href="/docs/button/">About cell actions</Link>
                  </TableCell>
                </TableRow>
              </TableFoot>
            </Table>
          </TableContainer>
          <output
            aria-label="Selected member"
            aria-live="polite"
            style={{ display: 'block', marginTop: '0.75rem' }}
          >
            Selected: {selected}
          </output>
        </div>
      </DemoPreview>
    </>
  )
}
