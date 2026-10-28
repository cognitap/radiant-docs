'use client'

import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  ThemeScope,
  type Theme
} from '@cognitap/radiant'
import { documentAPI } from './workshop-theme'
import type { ThemeSnapshot } from './workshop-snapshot'
import {
  brandSnapshot,
  defaultRecipe,
  readSharedTheme,
  startingSnapshot,
  startingThemes,
  type StartingTheme
} from './workshop-start'
import { errorMessage, maxConfigurationBytes } from './workshop-handoff'
import { decodeShare, sharePayload } from './workshop-share'
import { HexField } from './HexField'
import { BrandPicker } from './BrandPicker'

/** A finished-looking page at a fixed width, scaled to its card by CSS. Inert: the card's one
    button carries the name, so the sample is scenery. */
function ThemeSample({ theme }: { theme: Theme }) {
  return (
    <div
      className="start-sample"
      inert
      aria-hidden="true"
    >
      <ThemeScope
        theme={theme}
        mode="system"
        className="preview-page start-sample-page"
        data-rad-type-container=""
      >
        <p data-rad-text="ui-eyebrow">Workspace</p>
        <h2 data-rad-text="prose-title">Make room for the useful things</h2>
        <p data-rad-text="ui-body">
          A coherent system gives every small decision a place in the larger idea.
        </p>
        <div className="start-sample-row">
          <Button tabIndex={-1}>Continue</Button>
          <Button
            tabIndex={-1}
            variant="outline"
          >
            Save draft
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle level={3}>Monthly active</CardTitle>
            <CardDescription>Up 12% since March across four teams.</CardDescription>
          </CardHeader>
          <CardContent>
            <p data-rad-text="ui-metric">4,812</p>
          </CardContent>
        </Card>
      </ThemeScope>
    </div>
  )
}

const compiled = (snapshot: ThemeSnapshot) => documentAPI.compile(snapshot.document)

export function StartScreen({
  ready,
  notice,
  focusOnMount,
  onStart
}: {
  ready: boolean
  /** A message from the shell, such as a share link in the URL that did not open. */
  notice: string | null
  focusOnMount: boolean
  onStart: (baseline: ThemeSnapshot, label: string) => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const id = useId()
  const [brand, setBrand] = useState(defaultRecipe.brand)
  const [link, setLink] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const ticket = useRef(0)
  const deferredBrand = useDeferredValue(brand)
  const themes = useMemo(
    () =>
      startingThemes.map(theme => ({ theme, compiled: compiled(startingSnapshot(theme.recipe)) })),
    []
  )
  const brandTheme = useMemo(() => compiled(brandSnapshot(deferredBrand)), [deferredBrand])
  useEffect(() => {
    if (focusOnMount) heading.current?.focus()
  }, [focusOnMount])
  const message = error ?? notice
  function start(theme: StartingTheme) {
    onStart(startingSnapshot(theme.recipe), theme.name)
  }
  function open(text: string, source: string) {
    try {
      onStart(readSharedTheme(text), source)
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
      if (mine === ticket.current) open(text, 'Share link')
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
      if (mine === ticket.current) open(text, 'Configuration file')
    } catch (caught) {
      if (mine === ticket.current) setError(`Configuration file: ${errorMessage(caught)}`)
    }
  }
  return (
    <section
      className="workshop-start"
      aria-labelledby={`${id}-heading`}
    >
      <h3
        id={`${id}-heading`}
        ref={heading}
        tabIndex={-1}
      >
        Make a Radiant theme for your app
      </h3>
      <ul
        className="start-gallery"
        aria-label="Starting themes"
      >
        {themes.map(({ theme, compiled }) => (
          <li
            key={theme.id}
            className="start-card"
          >
            <ThemeSample theme={compiled} />
            <button
              type="button"
              className="start-card-button"
              disabled={!ready}
              aria-label={`Start from ${theme.name}: ${theme.character}`}
              onClick={() => start(theme)}
            >
              <span className="start-card-name">{theme.name}</span>
              <span className="start-card-character">{theme.character}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="start-options">
        <form
          className="start-option start-brand"
          aria-labelledby={`${id}-brand`}
          onSubmit={event => {
            event.preventDefault()
            onStart(brandSnapshot(brand), 'Your brand color')
          }}
        >
          <h4 id={`${id}-brand`}>Start from your brand color</h4>
          <div className="start-brand-controls">
            <div className="start-brand-fields">
              <HexField
                label="Your brand color"
                value={brand}
                disabled={!ready}
                onValid={setBrand}
              />
              <BrandPicker
                value={brand}
                disabled={!ready}
                onChange={setBrand}
              />
            </div>
            <ThemeSample theme={brandTheme} />
          </div>
          <Button
            type="submit"
            disabled={!ready}
          >
            Start with this color
          </Button>
        </form>
        <form
          className="start-option start-shared"
          aria-labelledby={`${id}-shared`}
          onSubmit={event => {
            event.preventDefault()
            void openLink()
          }}
        >
          <h4 id={`${id}-shared`}>Open a shared theme</h4>
          <Field label="Share link">
            <Input
              value={link}
              disabled={!ready}
              spellCheck={false}
              placeholder="https://…/workshop/#workshop=1.…"
              aria-describedby={message ? `${id}-message` : undefined}
              onChange={event => setLink(event.target.value)}
            />
          </Field>
          <Button
            type="submit"
            disabled={!ready || busy}
          >
            Open link
          </Button>
          <label className="start-file">
            Or choose a configuration file
            <input
              type="file"
              accept="application/json,.json"
              disabled={!ready}
              aria-describedby={message ? `${id}-message` : undefined}
              onChange={event => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void openFile(file)
              }}
            />
          </label>
          <output
            id={`${id}-message`}
            className="start-message"
            data-start-error={message ? '' : undefined}
          >
            {message}
          </output>
        </form>
      </div>
    </section>
  )
}
