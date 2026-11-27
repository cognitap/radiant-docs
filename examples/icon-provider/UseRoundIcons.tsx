'use client'
import {
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DatePicker,
  Field,
  IconProvider,
  Select,
  Spinner
} from '@cognitap/radiant'
import { roundIcons } from './roundIcons'

export function UseRoundIcons() {
  return (
    <IconProvider icons={roundIcons}>
      <div className="grid w-full max-w-md gap-4">
        <Checkbox
          label="Email updates"
          defaultChecked
        />
        <Checkbox
          label="All projects"
          indeterminate
        />
        <Field label="Team">
          <Select
            defaultValue="design"
            items={[
              { value: 'design', label: 'Design' },
              { value: 'research', label: 'Research' }
            ]}
          />
        </Field>
        <Field label="Due date">
          <DatePicker />
        </Field>
        <Collapsible>
          <CollapsibleTrigger>Shipping details</CollapsibleTrigger>
          <CollapsibleContent>Standard delivery in two days.</CollapsibleContent>
        </Collapsible>
        <div className="flex flex-wrap items-center gap-3">
          <Spinner label="Loading" />
          <Button pending>Saving</Button>
        </div>
      </div>
    </IconProvider>
  )
}
