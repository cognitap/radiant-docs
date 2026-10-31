'use client'
import { useRef, useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent,
  PopoverClose,
  Field,
  Input,
  Button,
  Checkbox,
  type PopoverProps,
  type PopoverContentProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
type Options = Pick<PopoverProps, 'defaultOpen'> &
  Pick<
    PopoverContentProps,
    'side' | 'align' | 'sideOffset' | 'collisionPadding' | 'motion' | 'className' | 'style'
  > & { dir?: 'ltr' | 'rtl' }
export type PopoverTask = 'delivery' | 'edit' | 'controlled' | 'placement'
const layout = { display: 'grid', gap: '1rem', justifyItems: 'start' }
const text = { margin: 0 }
const actions = { display: 'flex', flexWrap: 'wrap', justifyContent: 'end', gap: '.75rem' } as const

export function PopoverExample({
  task = 'delivery',
  ...options
}: Options & { task?: PopoverTask }) {
  return (
    <MotionProvider>
      {task === 'edit' ? (
        <EditTime {...options} />
      ) : task === 'controlled' ? (
        <PriceBreakdown {...options} />
      ) : task === 'placement' ? (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '16rem' }}>
          <Delivery {...options} />
        </div>
      ) : (
        <Delivery {...options} />
      )}
    </MotionProvider>
  )
}
function Delivery({ defaultOpen, dir, ...surface }: Options) {
  return (
    <div
      style={layout}
      dir={dir}
    >
      <Popover defaultOpen={defaultOpen}>
        <PopoverTrigger
          variant="outline"
          tone="neutral"
        >
          Delivery details
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent {...surface}>
            <p style={{ ...text, fontWeight: 600 }}>Standard delivery</p>
            <p style={text}>
              Your order arrives in three to five working days. Tracking is included.
            </p>
            <PopoverClose
              variant="outline"
              tone="neutral"
            >
              Got it
            </PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  )
}
function EditTime({ defaultOpen, dir, ...surface }: Options) {
  const [open, setOpen] = useState(defaultOpen ?? false),
    [time, setTime] = useState('09:00'),
    input = useRef<HTMLInputElement>(null)
  return (
    <div
      style={layout}
      dir={dir}
    >
      <output>Daily report delivery: {time}.</output>
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <PopoverTrigger variant="outline">Change delivery time</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            {...surface}
            // A popover stays nonmodal; its owner supplies dialog semantics.
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="dialog"
            aria-label="Report delivery time"
            initialFocusRef={input}
          >
            <form
              style={layout}
              onSubmit={event => {
                event.preventDefault()
                setTime(String(new FormData(event.currentTarget).get('time')))
                setOpen(false)
              }}
            >
              <Field label="Time">
                <Input
                  ref={input}
                  name="time"
                  type="time"
                  defaultValue={time}
                  required
                />
              </Field>
              <div style={actions}>
                <PopoverClose
                  variant="outline"
                  tone="neutral"
                >
                  Cancel
                </PopoverClose>
                <Button type="submit">Save time</Button>
              </div>
            </form>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  )
}
function PriceBreakdown({ defaultOpen, dir, ...surface }: Options) {
  const [open, setOpen] = useState(defaultOpen ?? false),
    [pinned, setPinned] = useState(false)
  return (
    <div
      style={layout}
      dir={dir}
    >
      <output>Price breakdown is {open ? 'open' : 'closed'}.</output>
      <Popover
        open={open}
        onOpenChange={next => {
          if (next || !pinned) setOpen(next)
        }}
      >
        <PopoverTrigger
          variant="outline"
          tone="neutral"
        >
          Price breakdown
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            {...surface}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="dialog"
            aria-label="Price breakdown"
          >
            <p style={text}>Subtotal 42.00, delivery 4.50, total 46.50.</p>
            <Checkbox
              label="Keep open while I compare"
              checked={pinned}
              onChange={event => setPinned(event.currentTarget.checked)}
            />
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => {
                setPinned(false)
                setOpen(false)
              }}
            >
              Done
            </Button>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </div>
  )
}
