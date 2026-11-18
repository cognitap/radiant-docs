'use client'
import { LocaleProvider, NumberFormatter } from '@cognitap/radiant'

export function CompareShipping() {
  return (
    <LocaleProvider locale="de-DE">
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
        <dt>On-time deliveries</dt>
        <dd>
          <NumberFormatter
            value={0.962}
            options={{ style: 'percent', maximumFractionDigits: 1 }}
          />
        </dd>
        <dt>Average distance</dt>
        <dd>
          <NumberFormatter
            value={128.4}
            options={{ style: 'unit', unit: 'kilometer' }}
          />
        </dd>
      </dl>
    </LocaleProvider>
  )
}
