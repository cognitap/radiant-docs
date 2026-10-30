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
  ToastClose
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

type Notice = { id: number; kind: 'save' | 'archive' }

export function ToastExample({ timed = false }: { timed?: boolean }) {
  const [saved, setSaved] = useState(false)
  const [archived, setArchived] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const next = useRef(0)

  function notify(kind: Notice['kind']) {
    const id = ++next.current
    if (kind === 'save') setSaved(true)
    else setArchived(true)
    setNotices(values => [...values, { id, kind }])
  }

  return (
    <div style={{ maxWidth: '34rem', width: '100%' }}>
      <ToastProvider duration={timed ? 6000 : 0}>
        <p>
          Notifications stay until dismissed unless you enable the optional timeout. Press F8 to
          reach the current notification.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          <Button onClick={() => notify('save')}>Save draft</Button>
          <Button
            variant="outline"
            tone="neutral"
            onClick={() => notify('archive')}
          >
            Archive draft
          </Button>
          {archived && (
            <Button
              variant="outline"
              onClick={() => setArchived(false)}
            >
              Restore draft
            </Button>
          )}
        </div>
        <p>
          Draft: {archived ? 'archived' : 'active'}. {saved ? 'Saved locally.' : 'Not saved yet.'}{' '}
          Notifications: {notices.length}.
        </p>
        <ToastViewport
          aria-label="Draft notifications"
          style={{
            position: 'relative',
            inset: 'auto',
            width: '100%',
            maxWidth: '100%',
            marginTop: '1rem'
          }}
        >
          {notices.map(notice => (
            <Toast
              key={notice.id}
              defaultOpen
              duration={notice.kind === 'archive' ? 0 : undefined}
              onOpenChange={open => {
                if (!open) setNotices(values => values.filter(value => value.id !== notice.id))
              }}
            >
              <ToastTitle level={3}>
                {notice.kind === 'save' ? 'Draft saved' : 'Draft archived'}
              </ToastTitle>
              <ToastDescription>
                {notice.kind === 'save'
                  ? 'Your latest changes are stored locally.'
                  : 'You can undo this change or use Restore draft.'}
              </ToastDescription>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {notice.kind === 'archive' && (
                  <ToastAction
                    altText="Undo archive is available here; Restore draft also remains on the page."
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
    </div>
  )
}
