'use client'
import { Avatar, Indicator } from '@cognitap/radiant'

export function ShowAvailability() {
  return (
    <Indicator
      label="Priya Shah"
      statusText="Online"
      position="bottom-end"
      offset={-3}
    >
      {target => (
        <Avatar
          alt={target['aria-label']}
          fallback="PS"
        />
      )}
    </Indicator>
  )
}
