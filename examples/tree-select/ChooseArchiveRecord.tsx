'use client'
import { Field, TreeSelect } from '@cognitap/radiant'

const archive = [
  {
    value: 'archive',
    label: 'Archive',
    children: Array.from({ length: 150 }, (_, index) => ({
      value: 'record-' + (index + 1),
      label: 'Record ' + (index + 1)
    }))
  }
]
export function ChooseArchiveRecord() {
  return (
    <Field
      label="Archive record"
      className="w-full max-w-sm"
    >
      <TreeSelect
        items={archive}
        defaultExpanded={['archive']}
        virtual={{ height: 192, rowHeight: 32 }}
      />
    </Field>
  )
}
