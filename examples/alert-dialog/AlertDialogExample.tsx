'use client'
import { useEffect, useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  type AlertDialogContentProps,
  type AlertDialogProps
} from '@cognitap/radiant'
export type AlertDialogOptions = Pick<AlertDialogContentProps, 'motion'> &
  Pick<AlertDialogProps, 'closeOnEscape'>
const actions = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'end',
  gap: '0.75rem'
} as const
const page = { display: 'grid', justifyItems: 'start', gap: '1rem' } as const
export function DiscardChanges({ motion, closeOnEscape }: AlertDialogOptions) {
  const [message, setMessage] = useState('Draft: Quarterly update')
  return (
    <div style={page}>
      <p>{message}</p>
      <AlertDialog closeOnEscape={closeOnEscape}>
        <AlertDialogTrigger>Discard draft</AlertDialogTrigger>
        <AlertDialogContent motion={motion}>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>Your latest edits will be lost.</AlertDialogDescription>
          <div style={actions}>
            <AlertDialogCancel
              variant="outline"
              tone="neutral"
            >
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              tone="danger"
              onClick={() => setMessage('Draft discarded.')}
            >
              Discard changes
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
export function DeleteProject({ motion, closeOnEscape }: AlertDialogOptions) {
  const [open, setOpen] = useState(false),
    [deleted, setDeleted] = useState(false),
    summary = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    // The opener is gone after deletion, so the app chooses where focus goes.
    if (deleted) summary.current?.focus()
  }, [deleted])
  return (
    <div style={page}>
      <p
        ref={summary}
        tabIndex={-1}
      >
        {deleted ? 'Project deleted. Your other projects are unchanged.' : 'Project: Summer launch'}
      </p>
      {deleted ? (
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => setDeleted(false)}
        >
          Restore example
        </Button>
      ) : (
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          closeOnEscape={closeOnEscape}
        >
          <AlertDialogTrigger
            variant="outline"
            tone="danger"
          >
            Delete project
          </AlertDialogTrigger>
          <AlertDialogContent motion={motion}>
            <AlertDialogTitle>Delete Summer launch?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the project and its files for everyone.
            </AlertDialogDescription>
            <div style={actions}>
              <AlertDialogCancel
                variant="outline"
                tone="neutral"
              >
                Keep project
              </AlertDialogCancel>
              <AlertDialogAction
                tone="danger"
                onClick={() => {
                  setOpen(false)
                  setDeleted(true)
                }}
              >
                Delete permanently
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
const revoke = () => new Promise<void>(resolve => setTimeout(resolve, 1500))
export function RevokeAccess({ motion, closeOnEscape = true }: AlertDialogOptions) {
  const [open, setOpen] = useState(false),
    [pending, setPending] = useState(false),
    [revoked, setRevoked] = useState(false)
  return (
    <div style={page}>
      <p>{revoked ? 'Access revoked for Ana Lopez.' : 'Ana Lopez can edit Summer launch.'}</p>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        closeOnEscape={closeOnEscape && !pending}
      >
        <AlertDialogTrigger
          variant="outline"
          tone="danger"
          disabled={revoked}
        >
          Revoke access
        </AlertDialogTrigger>
        <AlertDialogContent motion={motion}>
          <AlertDialogTitle>Revoke Ana’s access?</AlertDialogTitle>
          <AlertDialogDescription>
            Ana loses access to Summer launch immediately. You can invite her again later.
          </AlertDialogDescription>
          <div style={actions}>
            <AlertDialogCancel
              variant="outline"
              tone="neutral"
              disabled={pending}
            >
              Keep access
            </AlertDialogCancel>
            <AlertDialogAction
              tone="danger"
              pending={pending}
              onClick={async event => {
                event.preventDefault()
                setPending(true)
                await revoke()
                setPending(false)
                setRevoked(true)
                setOpen(false)
              }}
            >
              Revoke access
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
export function SignOutDevices({ motion, closeOnEscape }: AlertDialogOptions) {
  const [open, setOpen] = useState(false),
    [signedOut, setSignedOut] = useState(false)
  return (
    <div style={page}>
      <p>
        {signedOut ? 'Signed out of 2 other devices.' : 'Signed in on 3 devices.'} The dialog is{' '}
        {open ? 'open' : 'closed'}.
      </p>
      <Button
        variant="outline"
        tone="neutral"
        onClick={() => setOpen(true)}
      >
        Sign out other devices
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        closeOnEscape={closeOnEscape}
      >
        <AlertDialogContent motion={motion}>
          <AlertDialogTitle>Sign out other devices?</AlertDialogTitle>
          <AlertDialogDescription>
            Your other sessions end now. This device stays signed in.
          </AlertDialogDescription>
          <div style={actions}>
            <AlertDialogCancel
              variant="outline"
              tone="neutral"
            >
              Stay signed in
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => setSignedOut(true)}>Sign out</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type AlertDialogTask = 'discard' | 'delete' | 'async' | 'controlled'
export function AlertDialogExample({
  task = 'discard',
  ...options
}: AlertDialogOptions & { task?: AlertDialogTask }) {
  return (
    <MotionProvider>
      {task === 'delete' ? (
        <DeleteProject {...options} />
      ) : task === 'async' ? (
        <RevokeAccess {...options} />
      ) : task === 'controlled' ? (
        <SignOutDevices {...options} />
      ) : (
        <DiscardChanges {...options} />
      )}
    </MotionProvider>
  )
}
