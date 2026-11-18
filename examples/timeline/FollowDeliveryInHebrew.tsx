import { LocaleProvider, Timeline, TimelineItem } from '@cognitap/radiant'

export function FollowDeliveryInHebrew() {
  return (
    <LocaleProvider locale="he-IL">
      <Timeline
        aria-label="מעקב משלוח"
        className="w-64 max-w-full"
      >
        <TimelineItem
          label="החבילה נאספה"
          dateTime="2026-05-12T08:00:00"
          time="08:00"
        />
        <TimelineItem
          label="החבילה בדרך"
          dateTime="2026-05-12T10:15:00"
          time="10:15"
          active
          tone="accent"
        />
      </Timeline>
    </LocaleProvider>
  )
}
