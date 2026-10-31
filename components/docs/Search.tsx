'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Kbd,
  KbdGroup
} from '@cognitap/radiant'

const SearchPanel = dynamic(() => import('./SearchPanel').then(module => module.SearchPanel), {
  loading: () => <output>Loading search…</output>
})

export function Search() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== 'k'
      )
        return
      if (document.querySelector('dialog[open]')) return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, [contenteditable="true"]')
      )
        return
      event.preventDefault()
      setOpen(true)
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger variant="outline">
        Search docs
        <Shortcut />
      </DialogTrigger>
      <DialogContent className="docs-search-dialog">
        <div className="docs-dialog-heading">
          <DialogTitle>Search documentation</DialogTitle>
          <DialogClose
            variant="ghost"
            aria-label="Close search"
          >
            Close
          </DialogClose>
        </div>
        <DialogDescription>
          Search pages and headings. Use Tab or the arrow keys to reach a result, then Enter to open
          it.
        </DialogDescription>
        {open ? <SearchPanel onNavigate={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

const subscribe = () => () => {}

/** The platform is unknown on the server, so the hint appears after hydration. */
function Shortcut() {
  const modifier = useSyncExternalStore(
    subscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'),
    () => null
  )
  if (!modifier) return null
  return (
    <KbdGroup
      aria-hidden="true"
      className="search-shortcut"
    >
      <Kbd>{modifier}</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
}
