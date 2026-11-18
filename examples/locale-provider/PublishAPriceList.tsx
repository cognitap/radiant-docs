import { getLocaleAttributes, LocaleProvider, NumberFormatter } from '@cognitap/radiant'

export function PublishAPriceList() {
  const locale = 'de-DE'
  const euro = { style: 'currency', currency: 'EUR' } as const
  return (
    <ul
      {...getLocaleAttributes(locale)}
      className="grid list-disc gap-2 ps-5"
    >
      <LocaleProvider
        locale={locale}
        scope="document"
      >
        <li>
          Monatsabo:{' '}
          <NumberFormatter
            value={14.9}
            options={euro}
          />
        </li>
        <li>
          Jahresabo:{' '}
          <NumberFormatter
            value={149}
            options={euro}
          />
        </li>
      </LocaleProvider>
    </ul>
  )
}
