'use client'
import { Cascader, Field, type TreeItem } from '@cognitap/radiant'

const regions: readonly TreeItem[] = [
  {
    value: 'central',
    label: 'Central region',
    loadChildren: async () => [{ value: 'depot', label: 'Central depot' }]
  }
]
export function LocateWarehouse() {
  return (
    <Field
      label="Warehouse"
      className="w-full max-w-sm"
    >
      <Cascader
        items={regions}
        columnLabels={['Region', 'Depot']}
      />
    </Field>
  )
}
