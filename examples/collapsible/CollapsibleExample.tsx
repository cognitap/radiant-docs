'use client'

import { useId, useRef, useState, type RefObject } from 'react'
import {
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  Input,
  useCollapsible,
  type CollapsibleProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import { useHydrated } from '../profile/useHydrated'

export type CollapsibleTask = 'shipment' | 'notes' | 'review' | 'answers' | 'delivery'
type Presentation = Pick<CollapsibleProps, 'motion' | 'dir'>

const stack = { display: 'grid', gap: '1rem', width: '100%', maxWidth: '28rem', minWidth: 0 }
const row = { display: 'flex', flexWrap: 'wrap', gap: '.5rem' } as const

export function CollapsibleExample({
  task = 'shipment',
  ...props
}: Presentation & { task?: CollapsibleTask }) {
  return (
    <MotionProvider>
      {task === 'notes' ? (
        <ReleaseNotes {...props} />
      ) : task === 'review' ? (
        <OrderReview {...props} />
      ) : task === 'answers' ? (
        <ShippingAnswers {...props} />
      ) : task === 'delivery' ? (
        <DeliveryPreferences {...props} />
      ) : (
        <Shipment {...props} />
      )}
    </MotionProvider>
  )
}

function Shipment(props: Presentation) {
  const ready = useHydrated()
  const [update, setUpdate] = useState('')
  return (
    <div style={stack}>
      <p style={{ margin: 0 }}>Order 4821 ships in two days.</p>
      <Collapsible {...props}>
        <CollapsibleTrigger>Shipping details</CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ display: 'grid', gap: '.75rem', justifyItems: 'start' }}>
            <p style={{ margin: 0 }}>Standard delivery to 12 Harbour Street, Leeds.</p>
            <Button
              variant="outline"
              disabled={!ready}
              onClick={() => setUpdate('The package is being prepared for dispatch.')}
            >
              Track package
            </Button>
            <output>{update}</output>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function ReleaseNotes(props: Presentation) {
  return (
    <div style={stack}>
      <Collapsible
        {...props}
        defaultOpen
      >
        <CollapsibleTrigger>What changed this week</CollapsibleTrigger>
        <CollapsibleContent>
          <ul style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
            <li>Shared folders sync in the background.</li>
            <li>Search finds text inside attached files.</li>
            <li>Exports keep their original file names.</li>
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function OrderReview(props: Presentation) {
  const ready = useHydrated()
  const [open, setOpen] = useState(false)
  return (
    <div style={stack}>
      <p style={{ margin: 0 }}>Total due today: £48.00</p>
      <Collapsible
        {...props}
        open={open}
        onOpenChange={setOpen}
      >
        <CollapsibleTrigger>Price breakdown</CollapsibleTrigger>
        <CollapsibleContent>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '.25rem 1rem',
              margin: 0
            }}
          >
            <dt>Annual plan</dt>
            <dd style={{ margin: 0 }}>£40.00</dd>
            <dt>Tax</dt>
            <dd style={{ margin: 0 }}>£8.00</dd>
          </dl>
        </CollapsibleContent>
      </Collapsible>
      <div style={row}>
        <Button
          variant="outline"
          tone="neutral"
          disabled={!ready}
          onClick={() => setOpen(value => !value)}
        >
          {open ? 'Hide breakdown' : 'Show breakdown'}
        </Button>
      </div>
    </div>
  )
}

const answers = [
  { question: 'When will my order ship?', answer: 'Orders placed before 2 pm ship the same day.' },
  { question: 'Can I change the address?', answer: 'Yes, until the package leaves the warehouse.' },
  { question: 'How do returns work?', answer: 'Returns are free for 30 days from delivery.' }
]

function ShippingAnswers(props: Presentation) {
  const name = useId()
  return (
    <div style={{ ...stack, gap: '.75rem' }}>
      {answers.map(({ question, answer }, index) => (
        <Collapsible
          key={question}
          {...props}
          name={name}
          defaultOpen={index === 0}
        >
          <CollapsibleTrigger>{question}</CollapsibleTrigger>
          <CollapsibleContent>{answer}</CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}

function DoneButton({ summary }: { summary: RefObject<HTMLElement | null> }) {
  const disclosure = useCollapsible()
  return (
    <Button
      variant="ghost"
      tone="neutral"
      onClick={() => {
        disclosure?.setOpen(false)
        summary.current?.focus()
      }}
    >
      Done
    </Button>
  )
}

function DeliveryPreferences(props: Presentation) {
  const ready = useHydrated()
  const summary = useRef<HTMLElement>(null)
  const [feedback, setFeedback] = useState('')
  return (
    <form
      aria-label="Delivery preferences"
      style={stack}
      onReset={() => setFeedback('Fields reset. The panel stays as it was.')}
      onSubmit={event => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        setFeedback(
          `Saved ${data.get('email')}, ${data.has('digest') ? `digest at ${data.get('digestAt')}` : 'no digest'}.`
        )
      }}
    >
      <Field label="Delivery email">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          defaultValue="ada@example.com"
        />
      </Field>
      <Collapsible {...props}>
        <CollapsibleTrigger ref={summary}>Advanced options</CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
            <Checkbox
              name="digest"
              label="Send a daily digest"
              defaultChecked
            />
            <Field label="Digest time">
              <Input
                type="time"
                name="digestAt"
                defaultValue="09:00"
              />
            </Field>
            <DoneButton summary={summary} />
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div style={row}>
        <Button
          type="submit"
          disabled={!ready}
        >
          Save preferences
        </Button>
        <Button
          type="reset"
          variant="outline"
          tone="neutral"
        >
          Reset fields
        </Button>
      </div>
      <output>{feedback}</output>
    </form>
  )
}
