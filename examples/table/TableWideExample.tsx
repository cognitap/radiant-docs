'use client'
import { useId } from 'react'
import {
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableContainer
} from '@cognitap/radiant'
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const sites = [
  { site: 'Lisbon', sessions: [14, 18, 21, 19, 24, 26] },
  { site: 'Nairobi', sessions: [9, 11, 15, 17, 16, 20] },
  { site: 'Osaka', sessions: [22, 20, 25, 28, 27, 31] }
]
export function TableWideExample() {
  const captionId = useId()
  return (
    <div style={{ width: '32rem', maxWidth: '100%' }}>
      <TableContainer aria-labelledby={captionId}>
        <Table style={{ minWidth: '48rem' }}>
          <TableCaption id={captionId}>Sessions per site</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeader>Site</TableHeader>
              {months.map(month => (
                <TableHeader
                  key={month}
                  style={{ textAlign: 'end' }}
                >
                  {month}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sites.map(row => (
              <TableRow key={row.site}>
                <TableHeader scope="row">{row.site}</TableHeader>
                {row.sessions.map((count, index) => (
                  <TableCell
                    key={months[index]}
                    style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {count}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
