'use client'
import { useRef, useState } from 'react'
import {
  Button,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  type ToastProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type ToastTaskOptions = Pick<ToastProps, 'motion'>
const inline = { position: 'relative', inset: 'auto', maxWidth: '100%', marginTop: '1rem' } as const
const row = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem' } as const
export function PauseSync(options: ToastTaskOptions) {
  const [paused, setPaused] = useState(false)
  const [open, setOpen] = useState(false)
  return (
    <ToastProvider>
      <div style={row}>
        <Button
          onClick={() => {
            setPaused(!paused)
            setOpen(!paused)
          }}
        >
          {paused ? 'Resume sync' : 'Pause sync'}
        </Button>
        <output>Sync is {paused ? 'paused' : 'on'}.</output>
      </div>
      <ToastViewport style={inline}>
        <Toast
          {...options}
          open={open}
          onOpenChange={setOpen}
        >
          <ToastTitle>Sync paused</ToastTitle>
          <ToastDescription>Changes will upload when you resume.</ToastDescription>
          <ToastClose
            variant="ghost"
            tone="neutral"
          >
            Dismiss
          </ToastClose>
        </Toast>
      </ToastViewport>
    </ToastProvider>
  )
}
export function ConfirmSave(options: ToastTaskOptions) {
  const [open, setOpen] = useState(false)
  return (
    <ToastProvider duration={5000}>
      <Button onClick={() => setOpen(true)}>Save draft</Button>
      <ToastViewport style={inline}>
        <Toast
          {...options}
          open={open}
          onOpenChange={setOpen}
        >
          <ToastTitle>Draft saved</ToastTitle>
          <ToastDescription>Your latest edits are stored.</ToastDescription>
        </Toast>
      </ToastViewport>
    </ToastProvider>
  )
}
const reports = ['Quarterly report', 'Hiring plan', 'Launch checklist']
export function UndoDelete(options: ToastTaskOptions) {
  const [items, setItems] = useState(reports)
  const [deleted, setDeleted] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  return (
    <ToastProvider>
      <ul style={{ display: 'grid', gap: '.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
        {items.map(item => (
          <li
            key={item}
            style={{ ...row, justifyContent: 'space-between' }}
          >
            {item}
            <Button
              variant="outline"
              tone="danger"
              aria-label={`Delete ${item}`}
              onClick={() => {
                setItems(values => values.filter(value => value !== item))
                setDeleted(item)
                setOpen(true)
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <ToastViewport style={inline}>
        <Toast
          {...options}
          open={open}
          onOpenChange={setOpen}
        >
          <ToastTitle>{deleted} deleted</ToastTitle>
          <div style={row}>
            <ToastAction
              altText="Undo is available in Notifications, reached with F8."
              variant="outline"
              onClick={() => {
                if (deleted) setItems(values => [...values, deleted])
                setDeleted(null)
              }}
            >
              Undo
            </ToastAction>
            <ToastClose
              variant="ghost"
              tone="neutral"
            >
              Dismiss
            </ToastClose>
          </div>
        </Toast>
      </ToastViewport>
    </ToastProvider>
  )
}
export function ReportFailedUpload(options: ToastTaskOptions) {
  const [open, setOpen] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  return (
    <ToastProvider>
      <div style={row}>
        <Button
          onClick={() => {
            setUploaded(false)
            setOpen(true)
          }}
        >
          Upload invoice
        </Button>
        <output>{uploaded ? 'invoice.pdf uploaded.' : ''}</output>
      </div>
      <ToastViewport style={inline}>
        <Toast
          {...options}
          open={open}
          onOpenChange={setOpen}
          tone="danger"
          announce="assertive"
        >
          <ToastTitle>Upload failed</ToastTitle>
          <ToastDescription>The connection dropped before invoice.pdf finished.</ToastDescription>
          <div style={row}>
            <ToastAction
              altText="Retry the upload from Notifications, reached with F8."
              tone="danger"
              onClick={() => setUploaded(true)}
            >
              Retry
            </ToastAction>
            <ToastClose
              variant="ghost"
              tone="neutral"
            >
              Dismiss
            </ToastClose>
          </div>
        </Toast>
      </ToastViewport>
    </ToastProvider>
  )
}
type Notice = { id: number; kind: 'save' | 'archive' }
export function QueueDraftNotices(options: ToastTaskOptions) {
  const [saved, setSaved] = useState(false)
  const [archived, setArchived] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const next = useRef(0)
  function notify(kind: Notice['kind']) {
    if (kind === 'save') setSaved(true)
    else setArchived(true)
    setNotices(values => [...values, { id: ++next.current, kind }])
  }
  return (
    <ToastProvider>
      <div style={row}>
        <Button onClick={() => notify('save')}>Save draft</Button>
        <Button
          variant="outline"
          tone="neutral"
          onClick={() => notify('archive')}
        >
          Archive draft
        </Button>
      </div>
      <p>
        Draft: {archived ? 'archived' : 'active'}. {saved ? 'Saved locally.' : 'Not saved yet.'}{' '}
        Notifications: {notices.length}.
      </p>
      <ToastViewport
        aria-label="Draft notifications"
        style={inline}
      >
        {notices.map(notice => (
          <Toast
            key={notice.id}
            {...options}
            defaultOpen
            onOpenChange={open => {
              if (!open) setNotices(values => values.filter(value => value.id !== notice.id))
            }}
          >
            <ToastTitle>{notice.kind === 'save' ? 'Draft saved' : 'Draft archived'}</ToastTitle>
            <div style={row}>
              {notice.kind === 'archive' && (
                <ToastAction
                  altText="Undo archive is available in Draft notifications, reached with F8."
                  variant="outline"
                  onClick={() => setArchived(false)}
                >
                  Undo archive
                </ToastAction>
              )}
              <ToastClose
                variant="ghost"
                tone="neutral"
              >
                Dismiss notification
              </ToastClose>
            </div>
          </Toast>
        ))}
      </ToastViewport>
    </ToastProvider>
  )
}
const tasks = {
  sync: PauseSync,
  save: ConfirmSave,
  undo: UndoDelete,
  error: ReportFailedUpload,
  queue: QueueDraftNotices
}
export type ToastTask = keyof typeof tasks
export function ToastExample({
  task = 'sync',
  ...options
}: ToastTaskOptions & { task?: ToastTask }) {
  const Task = tasks[task]
  return (
    <MotionProvider>
      <div style={{ width: '100%', maxWidth: '28rem', minWidth: 0 }}>
        <Task {...options} />
      </div>
    </MotionProvider>
  )
}
