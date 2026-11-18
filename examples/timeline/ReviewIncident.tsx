import { Timeline, TimelineItem } from '@cognitap/radiant'

export function ReviewIncident() {
  return (
    <Timeline
      aria-label="Incident log"
      className="w-full max-w-md"
    >
      <TimelineItem
        label="Alert received"
        dateTime="2026-05-12T15:01:00Z"
        time="15:01 UTC"
        tone="danger"
        icon="!"
      >
        Checkout requests started returning errors.
      </TimelineItem>
      <TimelineItem
        label="Traffic restored"
        dateTime="2026-05-12T15:20:00Z"
        time="15:20 UTC"
        tone="accent"
        icon="✓"
        active
      >
        The previous build is serving requests.
      </TimelineItem>
    </Timeline>
  )
}
