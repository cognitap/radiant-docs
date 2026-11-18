'use client'

import { DataTable } from '@cognitap/radiant'
import { columns, getRowId, invoices } from './invoices'

export function SortInvoices() {
  return (
    <DataTable
      caption="Invoices"
      columns={columns}
      rows={invoices}
      getRowId={getRowId}
      className="w-full max-w-xl"
    />
  )
}
