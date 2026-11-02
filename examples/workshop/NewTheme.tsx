'use client'

import { useId, useRef, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Field,
  FileInput,
  Input
} from '@cognitap/radiant'
import { brandSnapshot, defaultRecipe, readSharedTheme, type StartingPoint } from './workshop-start'
import { errorMessage, maxConfigurationBytes } from './workshop-handoff'
import { decodeShare, sharePayload } from './workshop-share'
import { HexField } from './HexField'
import { BrandPicker } from './BrandPicker'

/** Start from a brand color or open a shared theme. `warning` names what the current theme loses. */
export function NewThemeDialog({
  open,
  warning,
  onOpenChange,
  onStart
}: {
  open: boolean
  warning: string | null
  onOpenChange: (open: boolean) => void
  onStart: (next: StartingPoint) => void
}) {
  const id = useId()
  const [brand, setBrand] = useState(defaultRecipe.brand)
  const [link, setLink] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const ticket = useRef(0)
  function openShared(text: string, source: string) {
    try {
      onStart({ start: { kind: 'shared', source }, baseline: readSharedTheme(text) })
    } catch (caught) {
      setError(`${source}: ${errorMessage(caught)}`)
    }
  }
  async function openLink() {
    const payload = sharePayload(link)
    if (payload === null) {
      setError('Share link: paste a workshop link that contains #workshop=.')
      return
    }
    const mine = ++ticket.current
    setBusy(true)
    try {
      const text = await decodeShare(payload)
      if (mine === ticket.current) openShared(text, 'Share link')
    } catch (caught) {
      if (mine === ticket.current) setError(`Share link: ${errorMessage(caught)}`)
    } finally {
      if (mine === ticket.current) setBusy(false)
    }
  }
  async function openFile(file: File) {
    const mine = ++ticket.current
    try {
      if (file.size > maxConfigurationBytes)
        throw new Error('Configuration exceeds 256 KiB. Use a smaller JSON file.')
      const text = await file.text()
      if (mine === ticket.current) openShared(text, 'Configuration file')
    } catch (caught) {
      if (mine === ticket.current) setError(`Configuration file: ${errorMessage(caught)}`)
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="workshop-new-theme">
        <DialogTitle>New theme</DialogTitle>
        {warning && <DialogDescription>{warning}</DialogDescription>}
        <form
          className="workshop-new-option"
          aria-labelledby={`${id}-brand`}
          onSubmit={event => {
            event.preventDefault()
            onStart({ start: { kind: 'brand', brand }, baseline: brandSnapshot(brand) })
          }}
        >
          <h3 id={`${id}-brand`}>Start from your brand color</h3>
          <HexField
            label="Your brand color"
            value={brand}
            onValid={setBrand}
          />
          <BrandPicker
            value={brand}
            onChange={setBrand}
          />
          <Button type="submit">Start with this color</Button>
        </form>
        <form
          className="workshop-new-option"
          aria-labelledby={`${id}-shared`}
          onSubmit={event => {
            event.preventDefault()
            void openLink()
          }}
        >
          <h3 id={`${id}-shared`}>Open a shared theme</h3>
          <Field label="Share link">
            <Input
              value={link}
              spellCheck={false}
              placeholder="https://…/workshop/#workshop=1.…"
              aria-describedby={error ? `${id}-message` : undefined}
              onChange={event => setLink(event.target.value)}
            />
          </Field>
          <Button
            type="submit"
            disabled={busy}
          >
            Open link
          </Button>
          <Field label="Or choose a configuration file">
            <FileInput
              controlSize="small"
              accept="application/json,.json"
              aria-describedby={error ? `${id}-message` : undefined}
              onChange={event => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void openFile(file)
              }}
            />
          </Field>
          <output
            id={`${id}-message`}
            className="workshop-new-message"
          >
            {error}
          </output>
        </form>
      </DialogContent>
    </Dialog>
  )
}
