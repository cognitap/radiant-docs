import { Kbd, KbdGroup, Stack } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function KbdExample() {
  return (
    <Stack
      orientation="horizontal"
      align="center"
      wrap
    >
      <Kbd>Esc</Kbd>
      <KbdGroup>
        <Kbd>Control</Kbd>+<Kbd>K</Kbd>
      </KbdGroup>
    </Stack>
  )
}
