import {
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  TableHeader,
  TableCell
} from '@cognitap/radiant'
const numeric = { textAlign: 'end', fontVariantNumeric: 'tabular-nums' } as const
const lines = [
  { item: 'Participant incentives', hours: 12, cost: 1800 },
  { item: 'Transcription', hours: 30, cost: 945.5 },
  { item: 'Lab booking', hours: 8, cost: 320 }
]
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export function TableTotalsExample() {
  return (
    <Table>
      <TableCaption>Study budget</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeader>Item</TableHeader>
          <TableHeader style={numeric}>Hours</TableHeader>
          <TableHeader style={numeric}>Cost</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.map(line => (
          <TableRow key={line.item}>
            <TableHeader scope="row">{line.item}</TableHeader>
            <TableCell style={numeric}>{line.hours}</TableCell>
            <TableCell style={numeric}>{money.format(line.cost)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableHeader scope="row">Total</TableHeader>
          <TableCell style={numeric}>{lines.reduce((sum, line) => sum + line.hours, 0)}</TableCell>
          <TableCell style={numeric}>
            {money.format(lines.reduce((sum, line) => sum + line.cost, 0))}
          </TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  )
}
