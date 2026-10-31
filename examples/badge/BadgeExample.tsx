import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type BadgeTone
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export const statuses = {
  draft: { label: 'Draft', tone: 'neutral' },
  approved: { label: 'Approved', tone: 'accent' },
  review: { label: 'Needs review', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'danger' }
} as const satisfies Record<string, { label: string; tone: BadgeTone }>
export type Status = keyof typeof statuses
export function ReleaseStatus({
  status,
  decorative = false
}: {
  status: Status
  decorative?: boolean
}) {
  const { label, tone } = statuses[status]
  return (
    <p>
      Release status: {decorative && <span>{label} </span>}
      <Badge
        tone={tone}
        decorative={decorative}
      >
        {label}
      </Badge>
    </p>
  )
}
const releases: { name: string; status: Status }[] = [
  { name: 'Spring catalogue', status: 'draft' },
  { name: 'Pricing update', status: 'approved' },
  { name: 'Partner portal', status: 'review' },
  { name: 'Data export', status: 'blocked' }
]
export function ReleaseTable() {
  return (
    <Table style={{ width: '24rem', maxWidth: '100%' }}>
      <TableCaption>Upcoming releases</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeader>Release</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {releases.map(release => (
          <TableRow key={release.name}>
            <TableHeader scope="row">{release.name}</TableHeader>
            <TableCell>
              <Badge tone={statuses[release.status].tone}>{statuses[release.status].label}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
const heading = { display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 } as const
export function ReviewCounts() {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h3 style={heading}>
        Open reviews <Badge>12</Badge>
      </h3>
      <h3 style={heading}>
        Comment threads <Badge tone="accent">New</Badge>
      </h3>
    </div>
  )
}
export function ApprovedNotice() {
  return (
    <p>
      Release approved.{' '}
      <Badge
        tone="accent"
        decorative
      >
        Approved
      </Badge>
    </p>
  )
}
