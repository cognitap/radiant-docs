import { Avatar, Button, type AvatarProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type AvatarOptions = Pick<AvatarProps, 'controlSize'>
export const photo =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="#d9e9df"/><circle cx="40" cy="29" r="15" fill="#346353"/><path d="M12 80v-8a28 28 0 0 1 56 0v8" fill="#346353"/></svg>'
  )
export const brokenPhoto = 'data:image/png;base64,broken'
const row = { display: 'flex', alignItems: 'center', gap: '.75rem' } as const
export function ProfileIdentity({
  src,
  nameShown,
  ...options
}: AvatarOptions & { src?: string; nameShown: boolean }) {
  return (
    <div style={row}>
      <Avatar
        {...options}
        alt={nameShown ? '' : 'Jordan Rivera'}
        fallback="JR"
        src={src}
      />
      {nameShown && <span>Jordan Rivera</span>}
    </div>
  )
}
export function ListMembers(options: AvatarOptions) {
  const members = [
    { name: 'Lee Chen', initials: 'LC' },
    { name: 'Sam Okafor', initials: 'SO' },
    { name: 'Guest reviewer' }
  ]
  return (
    <ul style={{ display: 'grid', gap: '.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
      {members.map(member => (
        <li
          key={member.name}
          style={row}
        >
          <Avatar
            {...options}
            alt=""
            fallback={member.initials}
          />
          {member.name}
        </li>
      ))}
    </ul>
  )
}
export function CommentAuthor({ src, ...options }: AvatarOptions & { src: string }) {
  return (
    <article style={{ display: 'flex', alignItems: 'flex-start', gap: '.75rem' }}>
      <Avatar
        {...options}
        alt="Jordan Rivera"
        src={src}
        fallback="JR"
      />
      <p style={{ margin: 0 }}>The second interview needs a transcript before Friday.</p>
    </article>
  )
}
export function ProfileButton(options: AvatarOptions) {
  return (
    <Button variant="outline">
      <span style={{ ...row, gap: '.5rem' }}>
        <Avatar
          {...options}
          alt=""
          src={photo}
          fallback="JR"
        />
        Jordan Rivera
      </span>
    </Button>
  )
}
const team = [
  { name: 'Jordan Rivera', initials: 'JR', src: photo },
  { name: 'Lee Chen', initials: 'LC' },
  { name: 'Sam Okafor', initials: 'SO' }
]
export function TeamStack(options: AvatarOptions) {
  return (
    <div style={{ display: 'flex' }}>
      {team.map((person, index) => (
        <Avatar
          {...options}
          key={person.name}
          alt={person.name}
          src={person.src}
          fallback={person.initials}
          style={{ marginInlineStart: index === 0 ? 0 : '-.5rem' }}
        />
      ))}
      <Avatar
        {...options}
        alt="2 more people"
        fallback="+2"
        style={{ marginInlineStart: '-.5rem' }}
      />
    </div>
  )
}
