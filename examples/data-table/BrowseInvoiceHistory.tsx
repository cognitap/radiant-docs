'use client'

import { DataTable } from '@cognitap/radiant'
import { columns, getRowId, invoices } from './invoices'

const history = Array.from({ length: 500 }, (_, index) => ({
  ...invoices[index % invoices.length],
  id: String(2301 + index),
  amount: (index * 37) % 2700
}))

export function BrowseInvoiceHistory() {
  return (
    <DataTable
      caption="Invoice history"
      columns={columns}
      rows={history}
      getRowId={getRowId}
      virtual={{ height: 244, rowHeight: 40 }}
      className="w-full max-w-xl"
      parts={{ table: { className: 'min-w-72' } }}
    />
  )
}
