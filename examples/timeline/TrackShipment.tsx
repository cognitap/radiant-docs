import { Timeline, TimelineItem } from '@cognitap/radiant'

export function TrackShipment() {
  return (
    <Timeline
      aria-label="Shipment activity"
      className="w-full max-w-md"
    >
      <TimelineItem
        label="Packed"
        dateTime="2026-05-12T09:15:00"
        time="9:15 AM"
      >
        The order is ready for collection.
      </TimelineItem>
      <TimelineItem
        label="Out for delivery"
        dateTime="2026-05-12T11:30:00"
        time="11:30 AM"
        tone="accent"
        active
      >
        Expected by 5 PM.
      </TimelineItem>
    </Timeline>
  )
}
