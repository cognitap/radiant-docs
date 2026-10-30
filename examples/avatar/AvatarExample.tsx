'use client'

import { Avatar } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export type AvatarSource = 'image' | 'missing' | 'fallback'

const image =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="#d9e9df"/><circle cx="40" cy="29" r="15" fill="#346353"/><path d="M12 80v-8a28 28 0 0 1 56 0v8" fill="#346353"/></svg>'
  )

export function AvatarExample({
  source = 'image',
  adjacent = true
}: {
  source?: AvatarSource
  adjacent?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Avatar
        alt={adjacent ? '' : 'Jordan Rivera'}
        fallback="JR"
        src={
          source === 'image'
            ? image
            : source === 'missing'
              ? 'data:image/png;base64,broken'
              : undefined
        }
      />
      {adjacent && <span>Jordan Rivera</span>}
    </div>
  )
}
