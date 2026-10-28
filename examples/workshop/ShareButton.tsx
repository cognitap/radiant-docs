'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@cognitap/radiant'
import { errorMessage, handoffAPI, jsonText, type Recipes } from './workshop-handoff'
import { encodeShare } from './workshop-share'
import { downloadText } from './workshop-download'

type Popover =
  | { kind: 'closed' }
  | { kind: 'link'; url: string; copied: boolean }
  | { kind: 'file'; message: string; text: string }
  | { kind: 'error'; message: string }

/** One click encodes the theme into a link and copies it; the link stays selectable in a small
    popover. A theme too large for a link offers the configuration file instead. */
export function ShareButton({
  document: themeDocument,
  recipes,
  disabled
}: {
  document: object
  recipes: Recipes
  disabled: boolean
}) {
  const [popover, setPopover] = useState<Popover>({ kind: 'closed' })
  const [busy, setBusy] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDialogElement>(null)
  const id = useId()
  const open = popover.kind !== 'closed'
  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>('input, button')?.focus()
    const outside = (event: PointerEvent) => {
      if (!host.current?.contains(event.target as Node)) setPopover({ kind: 'closed' })
    }
    window.document.addEventListener('pointerdown', outside)
    return () => window.document.removeEventListener('pointerdown', outside)
  }, [open])
  function close() {
    setPopover({ kind: 'closed' })
    trigger.current?.focus()
  }
  function escape(event: { key: string; stopPropagation: () => void }) {
    if (event.key === 'Escape' && open) {
      event.stopPropagation()
      close()
    }
  }
  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }
  async function share() {
    if (busy) return
    if (open) {
      close()
      return
    }
    setBusy(true)
    let text = ''
    try {
      text = jsonText(handoffAPI.configuration(themeDocument, recipes))
      const url = new URL(window.location.href)
      url.search = ''
      url.hash = `workshop=${await encodeShare(text)}`
      setPopover({ kind: 'link', url: url.href, copied: await copy(url.href) })
    } catch (error) {
      const message = errorMessage(error)
      setPopover(
        message.includes('too large for a share link')
          ? { kind: 'file', message, text }
          : { kind: 'error', message }
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div
      ref={host}
      className="workshop-share"
    >
      <Button
        ref={trigger}
        onKeyDown={escape}
        variant="outline"
        title="Share"
        disabled={disabled}
        pending={busy}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => void share()}
      >
        <svg
          className="workshop-history-icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 15V3m0 0L8 7m4-4 4 4" />
        </svg>
        <span className="workshop-history-label">Share</span>
      </Button>
      <dialog
        ref={panel}
        id={id}
        aria-label="Share link"
        className="share-popover"
        open={open}
        onKeyDown={escape}
      >
        {popover.kind === 'link' && (
          <>
            <output className="share-status">
              {popover.copied ? 'Link copied' : 'Copy failed. Select the link below.'}
            </output>
            <input
              type="text"
              readOnly
              aria-label="Share link"
              value={popover.url}
              onFocus={event => event.target.select()}
            />
          </>
        )}
        {popover.kind === 'file' && (
          <>
            <p>{popover.message}</p>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  downloadText(popover.text, 'radiant-workshop.json', 'application/json')
                  close()
                } catch (error) {
                  setPopover({ kind: 'error', message: errorMessage(error) })
                }
              }}
            >
              Download configuration
            </Button>
          </>
        )}
        {popover.kind === 'error' && <p>{popover.message}</p>}
        <Button
          variant="outline"
          onClick={close}
        >
          Close
        </Button>
      </dialog>
    </div>
  )
}
