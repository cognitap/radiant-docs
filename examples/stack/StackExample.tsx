import { Badge, Button, Stack, type StackProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type StackTask = 'actions' | 'tags'
export function StackExample({ task = 'actions', ...props }: StackProps & { task?: StackTask }) {
  if (task === 'tags')
    return (
      <Stack
        direction="horizontal"
        gap="tight"
        wrap
        style={{ maxWidth: '20rem' }}
      >
        {['Reading', 'Writing', 'Listening', 'Speaking', 'Grammar'].map(skill => (
          <Badge
            key={skill}
            tone="neutral"
          >
            {skill}
          </Badge>
        ))}
      </Stack>
    )
  return (
    <Stack
      {...props}
      style={{ width: '24rem', maxWidth: '100%' }}
    >
      <Button variant="outline">Draft</Button>
      <Button variant="outline">Review</Button>
      <Button>Publish</Button>
    </Stack>
  )
}
