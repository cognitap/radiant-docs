'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Select,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectPortal,
  SelectContent,
  SelectViewport,
  SelectItem,
  SelectItemText,
  SelectItemIndicator,
  SelectGroup,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@cognitap/radiant'
import type { SelectOption } from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'

export const workspaceOptions: readonly SelectOption[] = [
  { value: 'personal', label: 'Personal', textValue: 'Personal' },
  { value: 'studio', label: 'Studio', textValue: 'Studio' },
  { value: 'archive', label: 'Archive · unavailable', textValue: 'Archive', disabled: true },
  { value: 'team', label: 'Team', textValue: 'Team' }
]

export function SelectSettingsExample() {
  const [saved, setSaved] = useState('No changes saved')
  return (
    <MotionProvider>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle level={2}>Your workspace</CardTitle>
          <CardDescription>Choose where new ideas land.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            onSubmit={event => {
              event.preventDefault()
              setSaved(`Saved to ${new FormData(event.currentTarget).get('workspace')}`)
            }}
          >
            <Field
              label="Default workspace"
              description="You can move an idea later."
              required
            >
              <Select
                items={workspaceOptions}
                name="workspace"
                defaultValue="studio"
              />
            </Field>
            <Field
              label="Weekly digest"
              description="Your inbox, at your pace."
            >
              <Select
                items={[
                  { value: 'daily', label: 'Every day' },
                  { value: 'weekly', label: 'Once a week' },
                  { value: 'never', label: 'No email' }
                ]}
                name="digest"
                defaultValue="weekly"
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save preferences</Button>
              <Button
                type="reset"
                variant="ghost"
              >
                Reset
              </Button>
            </div>
            <output className="text-sm">{saved}</output>
          </form>
        </CardContent>
      </Card>
    </MotionProvider>
  )
}

export function SelectControlledExample() {
  const [value, setValue] = useState<string | null>('studio')
  const [accept, setAccept] = useState(true)
  return (
    <div className="grid w-80 max-w-full gap-4">
      <Field label="Workspace">
        <Select
          items={workspaceOptions}
          value={value}
          onValueChange={next => {
            if (accept) setValue(next)
          }}
        />
      </Field>
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={accept}
          onChange={event => setAccept(event.target.checked)}
        />
        Accept selection requests
      </label>
      <output>Selected: {value ?? 'none'}</output>
      <Button
        onClick={() => setValue(null)}
        variant="ghost"
      >
        Clear selection
      </Button>
    </div>
  )
}

const cities: readonly SelectOption[] = [
  'Amsterdam',
  'Athens',
  'Barcelona',
  'Berlin',
  'Copenhagen',
  'Dublin',
  'Edinburgh',
  'Florence',
  'Geneva',
  'Hamburg',
  'Helsinki',
  'Istanbul',
  'Lisbon',
  'London',
  'Lyon',
  'Madrid',
  'Milan',
  'Munich',
  'Naples',
  'Oslo',
  'Paris',
  'Prague',
  'Reykjavik',
  'Rome',
  'Rotterdam',
  'Seville',
  'Stockholm',
  'Tallinn',
  'Valencia',
  'Vienna',
  'Vilnius',
  'Warsaw',
  'Zagreb',
  'Zurich'
].map(label => ({ value: label.toLowerCase(), label }))
export function SelectCitiesExample() {
  return (
    <Field
      label="Home city"
      description="Type a city name to jump through the list."
      className="w-80 max-w-full"
    >
      <Select
        items={cities}
        defaultValue="rome"
      >
        <SelectTrigger>
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent position="popper">
            <SelectViewport>
              <SelectGroup label="Europe">
                {cities.map(item => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                  >
                    <SelectItemText />
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectViewport>
          </SelectContent>
        </SelectPortal>
      </Select>
    </Field>
  )
}

export function SelectDialogExample() {
  return (
    <Dialog>
      <DialogTrigger>Change workspace</DialogTrigger>
      <DialogContent>
        <DialogTitle>Choose a workspace</DialogTitle>
        <DialogDescription>The picker stays usable inside this modal.</DialogDescription>
        <Field label="Destination">
          <Select
            items={workspaceOptions}
            defaultValue="studio"
          />
        </Field>
        <DialogClose>Done</DialogClose>
      </DialogContent>
    </Dialog>
  )
}
