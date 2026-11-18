import type { DataTableColumn } from '@cognitap/radiant'

export type Invoice = { id: string; client: string; amount: number; paid: boolean }
export const invoices: readonly Invoice[] = [
  { id: '1012', client: 'Northwind', amount: 840, paid: true },
  { id: '1046', client: 'Cedar Studio', amount: 320, paid: false },
  { id: '1064', client: 'Juniper Works', amount: 560, paid: false }
]
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

export const getRowId = (row: Invoice) => row.id
export const columns: readonly DataTableColumn<Invoice>[] = [
  { id: 'client', header: 'Client', rowHeader: true, cell: row => row.client },
  {
    id: 'amount',
    header: 'Amount',
    width: 104,
    cell: row => money.format(row.amount),
    compare: (a, b) => a.amount - b.amount
  },
  { id: 'paid', header: 'Status', width: 86, cell: row => (row.paid ? 'Paid' : 'Open') }
]
