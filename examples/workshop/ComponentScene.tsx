'use client'

import { useId } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Checkbox,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Field,
  Input,
  Link,
  RadioGroup,
  Radio
} from '@cognitap/radiant'
import type { InspectionState } from './workshop-preview'

export function ComponentScene({
  state,
  count,
  onCount
}: {
  state: InspectionState
  count: number
  onCount: (count: number) => void
}) {
  const group = useId()
  const disabled = state === 'disabled'
  return (
    <div
      className="scene-stack"
      data-rad-text="ui-body"
    >
      <h2 data-rad-text="ui-title">Everyday components</h2>
      <div className="scene-actions">
        <Button
          disabled={disabled}
          pending={state === 'pending'}
          onClick={() => onCount(count + 1)}
        >
          Try the action
        </Button>
        <Button
          variant="outline"
          tone="neutral"
        >
          Secondary action
        </Button>
        <Link href="#content">Back to the workshop heading</Link>
      </div>
      <output data-rad-text="ui-supporting">Action activated {count} times.</output>
      <section
        aria-label="Control size comparison"
        className="scene-size-grid"
      >
        {(['small', 'medium', 'large'] as const).map(size => (
          <div
            className="scene-stack"
            key={size}
          >
            <h3 data-rad-text="ui-label">{size} controls</h3>
            <Button
              controlSize={size}
              disabled={disabled}
              pending={state === 'pending'}
            >
              {size} action
            </Button>
            <Field
              label={`${size} input`}
              disabled={disabled}
              error={state === 'invalid' ? 'Check this value.' : undefined}
            >
              <Input
                controlSize={size}
                placeholder={`${size} control`}
              />
            </Field>
            <Checkbox
              controlSize={size}
              label={`${size} selection`}
              disabled={disabled}
              defaultChecked
            />
          </div>
        ))}
      </section>
      <Field
        label="Project name"
        error={state === 'invalid' ? 'Enter a project name.' : undefined}
        disabled={disabled}
      >
        <Input placeholder="A new beginning" />
      </Field>
      <Checkbox
        label="Keep me informed"
        defaultChecked
        disabled={disabled}
      />
      <RadioGroup
        label="Delivery"
        name={group}
        defaultValue="weekly"
        disabled={disabled}
      >
        <Radio
          label="Weekly"
          value="weekly"
        />
        <Radio
          label="Monthly"
          value="monthly"
        />
      </RadioGroup>
      <Accordion defaultValue="details">
        <AccordionItem value="details">
          <AccordionTrigger level={3}>Project details</AccordionTrigger>
          <AccordionContent>Content follows the same theme as its trigger.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Collapsible>
        <CollapsibleTrigger>Additional notes</CollapsibleTrigger>
        <CollapsibleContent>Disclosure state belongs to this scene.</CollapsibleContent>
      </Collapsible>
      <Dialog>
        <DialogTrigger>Inspect overlay</DialogTrigger>
        <DialogContent>
          <DialogTitle>Review the surface</DialogTitle>
          <DialogDescription>
            Check the panel, backdrop and keyboard focus in the current mode.
          </DialogDescription>
          <DialogClose>Close inspection</DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}
