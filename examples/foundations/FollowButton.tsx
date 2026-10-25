'use client'

import { useState } from 'react'
import { Button } from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'

export function FollowButton() {
  const [following, setFollowing] = useState(false)
  const ready = useHydrated()
  return (
    <Button
      aria-pressed={following}
      disabled={!ready}
      onClick={() => setFollowing(value => !value)}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
