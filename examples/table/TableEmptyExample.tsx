import {
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell
} from '@cognitap/radiant'
type Invite = { email: string; role: string; sent: string }
const columns = ['Email', 'Role', 'Sent']
export function TableEmptyExample({ invites }: { invites: readonly Invite[] }) {
  return (
    <Table>
      <TableCaption>Pending invites</TableCaption>
      <TableHead>
        <TableRow>
          {columns.map(column => (
            <TableHeader key={column}>{column}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {invites.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length}>
              No pending invites. New invites appear here.
            </TableCell>
          </TableRow>
        ) : (
          invites.map(invite => (
            <TableRow key={invite.email}>
              <TableHeader scope="row">{invite.email}</TableHeader>
              <TableCell>{invite.role}</TableCell>
              <TableCell>{invite.sent}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
