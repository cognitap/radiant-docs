'use client'

import { useState } from 'react'
import { DataTable } from '@cognitap/radiant'
import { columns, getRowId, invoices } from './invoices'

export function SelectInvoices() {
  const [value, setValue] = useState<readonly string[]>([])
  return (
    <div className="grid w-full max-w-xl gap-2">
      <DataTable
        caption="Invoices to export"
        columns={columns}
        rows={invoices}
        getRowId={getRowId}
        selection={{
          value,
          onValueChange: setValue,
          allLabel: 'Select all open invoices',
          labelForRow: row => 'Select invoice ' + row.id,
          isRowDisabled: row => row.paid
        }}
      />
      <output className="text-sm">{value.length} selected</output>
    </div>
  )
}
