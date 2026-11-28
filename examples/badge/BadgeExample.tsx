import { Badge, Stack } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function BadgeExample() {
  return (
    <Stack
      orientation="horizontal"
      gap="tight"
      wrap
    >
      <Badge>Draft</Badge>
      <Badge tone="accent">Published</Badge>
      <Badge tone="warning">Needs review</Badge>
      <Badge tone="danger">Blocked</Badge>
    </Stack>
  )
}
