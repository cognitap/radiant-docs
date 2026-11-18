'use client'
import { Field, TreeSelect } from '@cognitap/radiant'

export function ChooseProjectFolder() {
  return (
    <Field
      label="Project folder"
      className="w-full max-w-sm"
    >
      <TreeSelect
        defaultExpanded={['projects']}
        items={[
          {
            value: 'projects',
            label: 'Projects',
            children: [
              { value: 'design', label: 'Design' },
              { value: 'operations', label: 'Operations' }
            ]
          }
        ]}
      />
    </Field>
  )
}
