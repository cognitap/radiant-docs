'use client'
import { useState } from 'react'
import { Button, Indicator } from '@cognitap/radiant'

export function ShowUnread() {
  const [count, setCount] = useState(120)
  return (
    <div className="grid w-full max-w-xs">
      <Indicator
        label="Inbox"
        statusText={count + ' unread messages'}
        count={count}
      >
        {target => (
          <Button
            {...target}
            onClick={() => setCount(0)}
          >
            Inbox
          </Button>
        )}
      </Indicator>
    </div>
  )
}
