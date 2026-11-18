'use client'

import { useState } from 'react'
import { Button, Calendar, type CalendarRange } from '@cognitap/radiant'

export function StudyPeriod() {
  const [period, setPeriod] = useState<CalendarRange | null>(null)
  return (
    <div className="grid justify-items-start gap-2">
      <Calendar
        type="range"
        aria-label="Study period"
        today="2028-03-06"
        value={period}
        onValueChange={setPeriod}
      />
      <output aria-live="polite">
        {period?.end
          ? period.start + ' – ' + period.end
          : period
            ? 'Choose an end date for ' + period.start
            : 'Choose a start date.'}
      </output>
      <Button
        variant="outline"
        disabled={!period}
        onClick={() => setPeriod(null)}
      >
        Clear period
      </Button>
    </div>
  )
}
