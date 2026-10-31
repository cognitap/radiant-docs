'use client'
import { useId, useRef, useState } from 'react'
import {
  Button,
  Checkbox,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerTitle,
  DrawerTrigger,
  Field,
  Input,
  type DrawerContentProps,
  type DrawerProps
} from '@cognitap/radiant'
export type DrawerOptions = Pick<DrawerContentProps, 'side' | 'motion' | 'className' | 'style'> &
  Pick<DrawerProps, 'modal' | 'closeOnBackdrop' | 'closeOnEscape'> & {
    dir?: 'ltr' | 'rtl'
    initialOpen?: boolean
    initialSize?: number
    disabled?: boolean
    pending?: boolean
  }
export function ProjectSettings({
  dir,
  initialOpen,
  initialSize = 1,
  disabled,
  pending,
  modal,
  closeOnBackdrop,
  closeOnEscape,
  ...surface
}: DrawerOptions) {
  const form = useId(),
    [saved, setSaved] = useState('Not saved'),
    [snap, setSnap] = useState(initialSize)
  return (
    <div
      dir={dir}
      style={{ display: 'grid', gap: '1rem' }}
    >
      <p>Keep the project in view while changing its settings.</p>
      <Drawer
        defaultOpen={initialOpen}
        snapPoint={snap}
        onSnapPointChange={setSnap}
        modal={modal}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
      >
        <DrawerTrigger
          disabled={disabled}
          pending={pending}
        >
          Project settings
        </DrawerTrigger>
        <DrawerContent {...surface}>
          <DrawerHandle
            aria-label="Resize project settings"
            disabled={disabled}
            pending={pending}
          />
          <DrawerTitle>Project settings</DrawerTitle>
          <DrawerDescription>Update the name and notifications, then save.</DrawerDescription>
          <form
            id={form}
            style={{ display: 'grid', gap: '1rem' }}
            onSubmit={event => {
              event.preventDefault()
              setSaved(`Saved ${new FormData(event.currentTarget).get('project')}`)
            }}
          >
            <Field label="Project name">
              <Input
                name="project"
                defaultValue="Atlas"
              />
            </Field>
            <Checkbox
              label="Email me about comments"
              name="comments"
              defaultChecked
            />
            <Button type="submit">Save settings</Button>
          </form>
          <output>{saved}</output>
          <DrawerClose variant="outline">Close settings</DrawerClose>
        </DrawerContent>
      </Drawer>
      <Button
        variant="outline"
        onClick={() => setSaved('Project is still available')}
      >
        Open project
      </Button>
      <p>Size: {Math.round(snap * 100)}%</p>
    </div>
  )
}
export function ReportOutline({
  dir,
  initialOpen,
  initialSize = 1,
  modal = false,
  closeOnBackdrop,
  closeOnEscape,
  disabled,
  pending,
  ...surface
}: DrawerOptions) {
  const [compact, setCompact] = useState(false)
  return (
    <div
      dir={dir}
      style={{ display: 'grid', gap: '1rem' }}
    >
      <p>Read the report alongside a non-modal outline.</p>
      <Drawer
        defaultOpen={initialOpen}
        defaultSnapPoint={initialSize}
        modal={modal}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
      >
        <DrawerTrigger
          disabled={disabled}
          pending={pending}
        >
          Report outline
        </DrawerTrigger>
        <DrawerContent {...surface}>
          <DrawerHandle
            aria-label="Resize report outline"
            disabled={disabled}
            pending={pending}
          />
          <DrawerTitle>Report outline</DrawerTitle>
          <DrawerDescription>Follow a section without blocking the page.</DrawerDescription>
          <Drawer defaultSnapPoint={0.5}>
            <DrawerTrigger variant="outline">Outline display</DrawerTrigger>
            <DrawerContent
              side="end"
              motion={surface.motion}
            >
              <DrawerHandle aria-label="Resize outline display" />
              <DrawerTitle>Outline display</DrawerTitle>
              <DrawerDescription>
                Change section spacing without leaving the report.
              </DrawerDescription>
              <Checkbox
                label="Compact section spacing"
                checked={compact}
                onChange={event => setCompact(event.currentTarget.checked)}
              />
              <DrawerClose>Back to outline</DrawerClose>
            </DrawerContent>
          </Drawer>
          <ol style={{ display: 'grid', gap: compact ? '0.5rem' : '1.5rem' }}>
            {['Overview', 'Research', 'Audience', 'Findings', 'Recommendations', 'References'].map(
              section => (
                <li key={section}>
                  <strong>{section}</strong>
                  <p>Review the supporting evidence and decisions for this section.</p>
                </li>
              )
            )}
          </ol>
          <DrawerClose>Close outline</DrawerClose>
        </DrawerContent>
      </Drawer>
      <Field label="Report notes">
        <Input defaultValue="Compare the findings" />
      </Field>
    </div>
  )
}
export function ReviewOrder({
  dir,
  initialOpen,
  initialSize = 1,
  disabled,
  pending,
  modal,
  closeOnBackdrop,
  closeOnEscape,
  ...surface
}: DrawerOptions) {
  const [open, setOpen] = useState(initialOpen ?? false),
    [allow, setAllow] = useState(false),
    [message, setMessage] = useState('Review your order before leaving.'),
    ref = useRef<HTMLDialogElement>(null)
  return (
    <div
      dir={dir}
      style={{ display: 'grid', gap: '1rem' }}
    >
      <p>Keep an unfinished order open until the owner accepts dismissal.</p>
      <Checkbox
        label="Keep review open"
        checked={!allow}
        onChange={event => setAllow(!event.currentTarget.checked)}
      />
      <Drawer
        open={open}
        onOpenChange={next => {
          if (next || allow) setOpen(next)
          else setMessage('Confirm that you are ready to leave.')
        }}
        defaultSnapPoint={initialSize}
        modal={modal}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
      >
        <DrawerTrigger
          disabled={disabled}
          pending={pending}
        >
          Review order
        </DrawerTrigger>
        <DrawerContent
          {...surface}
          ref={ref}
        >
          <DrawerHandle
            aria-label="Resize order review"
            disabled={disabled}
            pending={pending}
          />
          <DrawerTitle>Review order</DrawerTitle>
          <DrawerDescription>Two notebooks and one pen, total €28.</DrawerDescription>
          <Checkbox
            label="I am ready to leave"
            checked={allow}
            onChange={event => setAllow(event.currentTarget.checked)}
          />
          <output>{message}</output>
          <DrawerClose
            variant="outline"
            render={props => <button {...props}>{props.children}</button>}
          >
            Leave review
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export function ControlledFilters({
  dir,
  initialOpen,
  initialSize = 0.5,
  disabled,
  pending,
  modal,
  closeOnBackdrop,
  closeOnEscape,
  ...surface
}: DrawerOptions) {
  const [open, setOpen] = useState(initialOpen ?? false),
    [snapPoint, setSnapPoint] = useState(initialSize)
  return (
    <div
      dir={dir}
      style={{ display: 'grid', gap: '1rem' }}
    >
      <p>
        Filters are {open ? 'open' : 'closed'} at {Math.round(snapPoint * 100)}%.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Button
          variant="outline"
          disabled={disabled}
          pending={pending}
          onClick={() => {
            setSnapPoint(0.5)
            setOpen(true)
          }}
        >
          Open filters at half size
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          pending={pending}
          onClick={() => {
            setSnapPoint(1)
            setOpen(true)
          }}
        >
          Open filters at full size
        </Button>
      </div>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        snapPoint={snapPoint}
        onSnapPointChange={setSnapPoint}
        modal={modal}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
      >
        <DrawerContent
          {...surface}
          parts={{ viewport: { style: { gap: '0.75rem' } } }}
        >
          <DrawerHandle
            aria-label="Resize filters"
            disabled={disabled}
            pending={pending}
          />
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the study list by status.</DrawerDescription>
          <Checkbox
            label="Show archived studies"
            name="archived"
          />
          <DrawerClose variant="outline">Close filters</DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type DrawerTask = 'settings' | 'outline' | 'order' | 'controlled'
export function DrawerExample({
  task = 'settings',
  ...options
}: DrawerOptions & { task?: DrawerTask }) {
  return (
    <MotionProvider>
      {task === 'outline' ? (
        <ReportOutline {...options} />
      ) : task === 'order' ? (
        <ReviewOrder {...options} />
      ) : task === 'controlled' ? (
        <ControlledFilters {...options} />
      ) : (
        <ProjectSettings {...options} />
      )}
    </MotionProvider>
  )
}
