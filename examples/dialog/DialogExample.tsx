'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  type DialogContentProps,
  type DialogProps,
  Kbd
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type DialogOptions = Pick<DialogContentProps, 'motion' | 'className' | 'style'> &
  Pick<DialogProps, 'modal' | 'closeOnBackdrop' | 'closeOnEscape'>
const stack = { display: 'grid', justifyItems: 'start', gap: '1rem' } as const
const actions = { display: 'flex', flexWrap: 'wrap', gap: '.75rem' } as const
const shortcuts = [
  ['Ctrl + K', 'Search the workspace'],
  ['Ctrl + Enter', 'Send the current draft'],
  ['Shift + ?', 'Show these shortcuts']
]
export function ReviewShortcuts({
  modal,
  closeOnBackdrop,
  closeOnEscape,
  ...surface
}: DialogOptions) {
  return (
    <Dialog
      modal={modal}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
    >
      <DialogTrigger>Keyboard shortcuts</DialogTrigger>
      <DialogContent {...surface}>
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Work faster without leaving the keyboard.</DialogDescription>
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.5rem 1rem' }}>
          {shortcuts.map(([keys, action]) => (
            <div
              key={keys}
              style={{ display: 'contents' }}
            >
              <dt>
                <Kbd>{keys}</Kbd>
              </dt>
              <dd style={{ margin: 0 }}>{action}</dd>
            </div>
          ))}
        </dl>
        <form method="dialog">
          <Button type="submit">Done</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
const initialProfile = { name: 'Ada Lovelace', email: 'ada@example.com' }
export function EditProfile({
  modal,
  closeOnBackdrop = true,
  closeOnEscape = true,
  ...surface
}: DialogOptions) {
  const [saved, setSaved] = useState(initialProfile),
    [open, setOpen] = useState(false),
    [pending, setPending] = useState(false),
    [errors, setErrors] = useState({ name: '', email: '' }),
    timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <div style={stack}>
      <p style={{ margin: 0 }}>
        <strong>{saved.name}</strong> · {saved.email}
      </p>
      <Dialog
        open={open}
        onOpenChange={next => {
          if (pending) return
          if (next) setErrors({ name: '', email: '' })
          setOpen(next)
        }}
        modal={modal}
        closeOnBackdrop={closeOnBackdrop && !pending}
        closeOnEscape={closeOnEscape && !pending}
      >
        <DialogTrigger>Edit profile</DialogTrigger>
        <DialogContent {...surface}>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update the name and email your team sees.</DialogDescription>
          <form
            key={String(open)}
            noValidate
            style={{ display: 'grid', gap: '1rem' }}
            onSubmit={event => {
              event.preventDefault()
              const data = new FormData(event.currentTarget),
                name = String(data.get('name')).trim(),
                email = String(data.get('email')).trim(),
                next = {
                  name: name.length < 2 ? 'Use at least two characters.' : '',
                  email: /^\S+@\S+\.\S+$/.test(email) ? '' : 'Enter a valid email.'
                }
              setErrors(next)
              if (next.name || next.email) return
              setPending(true)
              timer.current = setTimeout(() => {
                setSaved({ name, email })
                setPending(false)
                setOpen(false)
              }, 650)
            }}
          >
            <Field
              label="Display name"
              required
              error={errors.name}
            >
              <Input
                name="name"
                autoComplete="name"
                defaultValue={saved.name}
                readOnly={pending}
              />
            </Field>
            <Field
              label="Email"
              required
              error={errors.email}
            >
              <Input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={saved.email}
                readOnly={pending}
              />
            </Field>
            <div style={actions}>
              <Button
                type="submit"
                pending={pending}
              >
                Save profile
              </Button>
              <DialogClose
                variant="outline"
                tone="neutral"
                disabled={pending}
              >
                Cancel
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
const orders = [
  { id: '1042', item: 'Desk lamp', status: 'Shipped', total: '$48.00' },
  { id: '1043', item: 'Notebook set', status: 'Packing', total: '$22.50' },
  { id: '1044', item: 'Monitor arm', status: 'Delivered', total: '$129.00' }
]
export function ReviewOrders({ modal, closeOnBackdrop, closeOnEscape, ...surface }: DialogOptions) {
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState(orders[0])
  return (
    <div style={stack}>
      <ul style={{ display: 'grid', gap: '.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
        {orders.map(order => (
          <li
            key={order.id}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.75rem' }}
          >
            <span>
              Order {order.id}: {order.item}
            </span>
            <Button
              variant="outline"
              tone="neutral"
              controlSize="small"
              aria-label={`View order ${order.id}`}
              onClick={() => {
                setSelected(order)
                setOpen(true)
              }}
            >
              View
            </Button>
          </li>
        ))}
      </ul>
      <output>{open ? `Order ${selected.id} is open.` : 'No order is open.'}</output>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        modal={modal}
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape={closeOnEscape}
      >
        <DialogContent {...surface}>
          <DialogTitle>Order {selected.id}</DialogTitle>
          <DialogDescription>
            {selected.item}, {selected.total}.
          </DialogDescription>
          <p style={{ margin: 0 }}>Status: {selected.status}</p>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}
const sections = [
  ['What we collect', 'Your name, email and the files you upload to shared projects.'],
  ['Why we collect it', 'To sign you in, sync your work and show teammates who changed what.'],
  ['Where it lives', 'In encrypted storage in the region your workspace owner chose.'],
  ['Who can see it', 'Members of the projects you join, and support staff when you ask for help.'],
  ['How long we keep it', 'Until you delete it, plus 30 days of backups.'],
  ['Exporting your data', 'Download every file and comment from your account settings.'],
  ['Deleting your account', 'Removes your profile now and your files after the backup window.'],
  ['Changes to this policy', 'We email you two weeks before any change takes effect.']
]
export function ReadPolicy({ modal, closeOnBackdrop, closeOnEscape, ...surface }: DialogOptions) {
  return (
    <Dialog
      modal={modal}
      closeOnBackdrop={closeOnBackdrop}
      closeOnEscape={closeOnEscape}
    >
      <DialogTrigger variant="outline">Read the data policy</DialogTrigger>
      <DialogContent {...surface}>
        <DialogTitle>Data policy</DialogTitle>
        <DialogDescription>How your workspace data is collected and kept.</DialogDescription>
        {sections.map(([heading, body]) => (
          <section key={heading}>
            <h3 style={{ marginBlock: '0 .25rem' }}>{heading}</h3>
            <p style={{ margin: 0 }}>{body}</p>
          </section>
        ))}
        <DialogClose>Close policy</DialogClose>
      </DialogContent>
    </Dialog>
  )
}
export type DialogTask = 'shortcuts' | 'profile' | 'orders' | 'policy'
export function DialogExample({
  task = 'shortcuts',
  ...options
}: DialogOptions & { task?: DialogTask }) {
  return (
    <MotionProvider>
      {task === 'profile' ? (
        <EditProfile {...options} />
      ) : task === 'orders' ? (
        <ReviewOrders {...options} />
      ) : task === 'policy' ? (
        <ReadPolicy {...options} />
      ) : (
        <ReviewShortcuts {...options} />
      )}
    </MotionProvider>
  )
}
