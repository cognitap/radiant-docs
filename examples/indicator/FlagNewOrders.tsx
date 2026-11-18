'use client'
import { Indicator, Link, LocaleProvider } from '@cognitap/radiant'

export function FlagNewOrders() {
  return (
    <LocaleProvider locale="ar">
      <Indicator
        label="الطلبات"
        statusText="١٨ طلبًا جديدًا"
        count={18}
        maxCount={9}
        offset={2}
        tone="warning"
      >
        {target => (
          <Link
            {...target}
            href="#examples"
            variant="outline"
          >
            الطلبات
          </Link>
        )}
      </Indicator>
    </LocaleProvider>
  )
}
