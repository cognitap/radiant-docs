'use client'

import { useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  ThemeScope
} from '@cognitap/radiant'
import { radiant } from '@cognitap/radiant/examples'
import type { CompositionOptions } from './composition-types'
import { useHydrated } from '../profile/useHydrated'
import '@cognitap/radiant/styles.css'
import './composition-example.css'

export function DialogExample({
  theme = radiant,
  mode = 'light',
  compact = false,
  controlled = false,
  modal = true,
  closeOnEscape = true,
  closeOnBackdrop = true
}: CompositionOptions & {
  controlled?: boolean
  modal?: boolean
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const ready = useHydrated()
  const owner = controlled ? { open, onOpenChange: setOpen } : { defaultOpen: false }
  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="composition-example"
    >
      <div className="composition-stack">
        <Dialog
          {...owner}
          modal={modal}
          closeOnEscape={closeOnEscape}
          closeOnBackdrop={closeOnBackdrop}
        >
          <div className="composition-actions">
            <DialogTrigger
              ref={triggerRef}
              disabled={!ready}
              variant="outline"
              render={props => (
                <button
                  {...props}
                  data-review-trigger="true"
                />
              )}
            >
              Review release notes
            </DialogTrigger>
            <Button
              variant="ghost"
              onClick={() => triggerRef.current?.focus()}
            >
              Focus trigger
            </Button>
          </div>
          <DialogContent
            style={{
              position: modal ? undefined : 'static',
              ...(compact ? { '--rad-dialog-width': '24rem', '--rad-dialog-padding': '1rem' } : {})
            }}
          >
            <DialogTitle>Review this release</DialogTitle>
            <DialogDescription>
              Check the notes, then mark them reviewed. This example records your choice locally.
            </DialogDescription>
            <p className="composition-copy">
              This release brings shared themes and native behavior to the component library. Check
              the keyboard interactions and the appearance in your application before updating.
            </p>
            <div className="composition-actions">
              <DialogClose onClick={() => setReviewed(true)}>Mark as reviewed</DialogClose>
              <DialogClose variant="ghost">Close review</DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        <output className="composition-result">
          {reviewed ? 'Review recorded locally.' : 'No review recorded.'}
        </output>
      </div>
    </ThemeScope>
  )
}
