'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Button } from '@cognitap/radiant'
import { useDemoRevision } from '@/components/demo/DemoFrame'
import { useHydrated } from '../profile/useHydrated'
import {
  errorMessage,
  handoffAPI,
  jsonText,
  maxConfigurationBytes,
  sectionNames,
  type ImportData,
  type Recipes,
  type SectionName
} from './workshop-handoff'
import { decodeShare, encodeShare } from './workshop-share'
import { fontRequirements, fontSetup } from './font-requirements'
import './theme-handoff.css'

export interface ImportResult {
  ok: boolean
  message: string
}
export function ThemeHandoff({
  document: themeDocument,
  recipes,
  result,
  onImport,
  onError
}: {
  document: object
  recipes: Recipes
  result: ImportResult | null
  onImport: (data: ImportData, mode: 'merge' | 'replace') => void
  onError: (message: string) => void
}) {
  const resultId = useId()
  const ready = useHydrated()
  const revision = useDemoRevision()
  const [selected, setSelected] = useState<SectionName[]>([
    'color',
    'surface',
    'control',
    'spacing'
  ])
  const [applyMode, setApplyMode] = useState<'merge' | 'replace'>('merge')
  const [input, setInput] = useState('')
  const [link, setLink] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState('')
  const operation = useRef({ ticket: 0 })
  const prepared = useMemo(() => {
    if (!handoffAPI) return null
    try {
      const config = handoffAPI.configuration(themeDocument, recipes)
      let css = '',
        cssError = '',
        typographyCSS = '',
        typographyCSSError = ''
      try {
        css = handoffAPI.cssOutput(config.document)
      } catch (error) {
        cssError = errorMessage(error)
      }
      try {
        typographyCSS = handoffAPI.cssOutput(config.document, ['typography'])
      } catch (error) {
        typographyCSSError = errorMessage(error)
      }
      return {
        config,
        typed: handoffAPI.typedTheme(config.document),
        css,
        cssError,
        typographyTyped: handoffAPI.typedTheme(config.document, ['typography']),
        typographyCSS,
        typographyCSSError,
        motionTyped: handoffAPI.typedTheme(config.document, ['motion']),
        runtime: handoffAPI.runtimeSetup(),
        setup: fontSetup(config.document),
        error: ''
      }
    } catch (error) {
      return {
        config: null,
        typed: '',
        css: '',
        cssError: '',
        typographyTyped: '',
        typographyCSS: '',
        typographyCSSError: '',
        motionTyped: '',
        runtime: { install: '', source: '' },
        setup: '',
        error: errorMessage(error)
      }
    }
  }, [themeDocument, recipes])
  const sections =
    prepared?.config && handoffAPI
      ? jsonText(handoffAPI.sections(prepared.config.document, selected))
      : ''
  const configText = prepared?.config ? jsonText(prepared.config) : ''
  useEffect(() => {
    let active = true
    const pending = operation.current
    const restore = async () => {
      const ticket = ++operation.current.ticket
      if (!window.location.hash.startsWith('#workshop=')) return
      try {
        if (!handoffAPI)
          throw new Error(
            'This shared configuration needs a Radiant package with document APIs. Open it in the labeled candidate preview.'
          )
        const text = await decodeShare(window.location.hash.slice('#workshop='.length))
        const data = handoffAPI.read(text)
        if (data.kind !== 'radiant-workshop')
          throw new Error('A share link must contain a full workshop configuration.')
        if (active && ticket === operation.current.ticket) onImport(data, 'replace')
      } catch (error) {
        if (active && ticket === operation.current.ticket)
          onError(`Share link: ${errorMessage(error)} Current theme retained.`)
      }
    }
    if (revision > 0 && window.location.hash.startsWith('#workshop=')) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`
      )
    } else void restore()
    window.addEventListener('hashchange', restore)
    return () => {
      active = false
      pending.ticket++
      window.removeEventListener('hashchange', restore)
    }
  }, [revision, onImport, onError])
  function importText(text: string) {
    operation.current.ticket++
    try {
      if (!handoffAPI) throw new Error('The installed package does not support document import.')
      onImport(handoffAPI.read(text), applyMode)
      setFeedback('')
    } catch (error) {
      onError(`Import: ${errorMessage(error)} Current theme retained.`)
    }
  }
  async function importFile(file: File) {
    const ticket = ++operation.current.ticket
    try {
      if (file.size > maxConfigurationBytes)
        throw new Error('Configuration exceeds 256 KiB. Use a smaller JSON file.')
      const text = await file.text()
      if (ticket === operation.current.ticket) importText(text)
    } catch (error) {
      if (ticket === operation.current.ticket)
        onError(`Import: ${errorMessage(error)} Current theme retained.`)
    }
  }
  async function copy(text: string, label: string) {
    if (busy) return
    setBusy(label)
    try {
      await navigator.clipboard.writeText(text)
      setFeedback(`${label} copied.`)
    } catch {
      setFeedback(`Copy failed. Select and copy the ${label.toLowerCase()} field below.`)
    } finally {
      setBusy('')
    }
  }
  function download(text: string, name: string, type: string) {
    try {
      if (
        type === 'application/json' &&
        new TextEncoder().encode(text).length > maxConfigurationBytes
      )
        throw new Error('Configuration exceeds 256 KiB. Copy the typed theme instead.')
      const url = URL.createObjectURL(new Blob([text], { type }))
      const anchor = window.document.createElement('a')
      anchor.href = url
      anchor.download = name
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setFeedback(`${name} downloaded.`)
    } catch (error) {
      setFeedback(`Download failed: ${errorMessage(error)} Copy the field below instead.`)
    }
  }
  async function share() {
    if (busy || !configText) return
    setBusy('Share link')
    try {
      const payload = await encodeShare(configText)
      const url = new URL(window.location.href)
      url.search = ''
      url.hash = `workshop=${payload}`
      setLink(url.href)
      try {
        await navigator.clipboard.writeText(url.href)
        setFeedback(
          'Share link copied. It includes the theme and editor recipes; specimen form data stays local.'
        )
      } catch {
        setFeedback('Copy failed. Select and copy the share link field below.')
      }
    } catch (error) {
      setFeedback(errorMessage(error))
    } finally {
      setBusy('')
    }
  }
  const unavailable = !ready || !prepared?.config
  const fonts = prepared?.config ? fontRequirements(prepared.config.document) : []
  return (
    <section
      className="theme-handoff"
      aria-label="Theme handoff"
    >
      <h3>Use your theme</h3>
      <p>
        Take a typed Radiant theme, save an editable configuration or share an account-free link.
        Files and links include theme values and available editor recipes. Specimen interactions
        stay local.
      </p>
      {!handoffAPI && (
        <p className="workshop-notice">
          Theme handoff needs a package with the public document APIs. Use the labeled candidate
          preview; the published pin remains available for specimen inspection.
        </p>
      )}
      {prepared?.error && <p>{prepared.error}</p>}
      <output className="handoff-feedback">{feedback}</output>
      <output
        id={resultId}
        className={result?.ok === false ? 'handoff-import-error' : 'handoff-import-result'}
      >
        {result?.message ?? ''}
      </output>
      <fieldset disabled={unavailable}>
        <legend>Theme and configuration</legend>
        <div className="workshop-actions">
          <Button
            aria-disabled={!!busy}
            pending={busy === 'Typed theme'}
            onClick={() => void copy(prepared?.typed ?? '', 'Typed theme')}
          >
            Copy typed theme
          </Button>
          <Button
            variant="outline"
            onClick={() => download(prepared?.typed ?? '', 'radiant-theme.ts', 'text/typescript')}
          >
            Download typed theme
          </Button>
          <Button
            variant="outline"
            onClick={() => download(configText, 'radiant-workshop.json', 'application/json')}
          >
            Download configuration
          </Button>
          <Button
            variant="outline"
            aria-disabled={!!busy}
            pending={busy === 'Share link'}
            onClick={() => void share()}
          >
            Copy share link
          </Button>
        </div>
        <label>
          Share link
          <input
            type="text"
            readOnly
            value={link}
            onFocus={event => event.target.select()}
          />
        </label>
        <details open>
          <summary>Typed Radiant theme · primary output</summary>
          <label>
            Typed theme output
            <textarea
              readOnly
              rows={14}
              wrap="off"
              value={prepared?.typed ?? ''}
            />
          </label>
        </details>
        <details>
          <summary>Reusable configuration JSON</summary>
          <p>
            Contains the complete authoring document, palette/font metadata and available editor
            recipes. Import it to resume the same configuration.
          </p>
          <Button
            variant="outline"
            aria-disabled={!!busy}
            onClick={() => void copy(configText, 'Configuration')}
          >
            Copy configuration
          </Button>
          <label>
            Configuration output
            <textarea
              readOnly
              rows={12}
              wrap="off"
              value={configText}
            />
          </label>
        </details>
        <details>
          <summary>Selective section JSON</summary>
          <p>
            Select whole public sections. Color needs Surface for its canvas; Surface also contains
            geometry. Component exceptions are included only when selected.
          </p>
          <div className="handoff-sections">
            {sectionNames.map(name => (
              <label key={name}>
                <input
                  type="checkbox"
                  checked={selected.includes(name)}
                  onChange={event =>
                    setSelected(previous =>
                      event.target.checked
                        ? [...previous, name]
                        : previous.filter(value => value !== name)
                    )
                  }
                />
                {name}
              </label>
            ))}
          </div>
          <div className="workshop-actions">
            <Button
              variant="outline"
              aria-disabled={!!busy}
              onClick={() => void copy(sections, 'Sections')}
            >
              Copy sections
            </Button>
            <Button
              variant="outline"
              onClick={() => download(sections, 'radiant-sections.json', 'application/json')}
            >
              Download sections
            </Button>
          </div>
          <label>
            Section output
            <textarea
              readOnly
              rows={12}
              wrap="off"
              value={sections}
            />
          </label>
        </details>
        <details>
          <summary>Scoped CSS · full theme</summary>
          <p>
            Load Radiant’s compiled styles first, then this CSS. Put{' '}
            <code>className="radiant-export"</code> and <code>data-rad-mode="light"</code>,{' '}
            <code>"dark"</code> or <code>"system"</code> on a plain wrapper. For React ThemeScope
            and nested modes, use the typed theme instead.
          </p>
          <p>
            This output carries CSS timing tokens, not physical spring profiles. A sampled CSS curve
            restarts when interrupted; the runtime retains position and momentum. This release
            provides no sampled spring CSS export. Use the typed theme and runtime setup below for
            spring motion.
          </p>
          {prepared?.cssError ? (
            <p>{prepared.cssError}</p>
          ) : (
            <>
              <Button
                variant="outline"
                aria-disabled={!!busy}
                onClick={() => void copy(prepared?.css ?? '', 'CSS')}
              >
                Copy CSS
              </Button>
              <Button
                variant="outline"
                onClick={() => download(prepared?.css ?? '', 'radiant-theme.css', 'text/css')}
              >
                Download CSS
              </Button>
              <label>
                CSS output
                <textarea
                  readOnly
                  rows={12}
                  wrap="off"
                  value={prepared?.css ?? ''}
                />
              </label>
            </>
          )}
        </details>
        <details>
          <summary>Motion only · typed configuration</summary>
          <p>
            Save this as <code>radiant-motion.ts</code>. Call <code>applyMotion(target)</code>,
            compile the returned document and pass the theme to ThemeScope. Replace restores omitted
            motion values to defaults; Merge retains omitted leaves. Other sections stay authored.
            The file includes physics and legacy CSS timing; a device’s reduced-motion preference is
            read by the runtime, never saved into the theme.
          </p>
          <div className="workshop-actions">
            <Button
              variant="outline"
              aria-disabled={!!busy}
              onClick={() => void copy(prepared?.motionTyped ?? '', 'Motion typed theme')}
            >
              Copy motion TypeScript
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                download(prepared?.motionTyped ?? '', 'radiant-motion.ts', 'text/typescript')
              }
            >
              Download motion TypeScript
            </Button>
          </div>
          <label>
            Motion TypeScript output
            <textarea
              readOnly
              rows={12}
              wrap="off"
              value={prepared?.motionTyped ?? ''}
            />
          </label>
        </details>
        <details>
          <summary>Typography only · typed and CSS</summary>
          <p>
            Apply the typed section to an existing document with <code>applyTypography</code>. It
            retains colors, surfaces, control sizes, motion and component exceptions. The CSS
            wrapper uses <code>className="radiant-typography"</code> and the same mode attribute;
            its declarations affect typography only. Use the typed route for nested ThemeScope
            modes.
          </p>
          <div className="workshop-actions">
            <Button
              variant="outline"
              aria-disabled={!!busy}
              onClick={() => void copy(prepared?.typographyTyped ?? '', 'Typography typed theme')}
            >
              Copy typography TypeScript
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                download(
                  prepared?.typographyTyped ?? '',
                  'radiant-typography.ts',
                  'text/typescript'
                )
              }
            >
              Download typography TypeScript
            </Button>
            <Button
              variant="outline"
              aria-disabled={!!busy}
              disabled={!!prepared?.typographyCSSError}
              onClick={() => void copy(prepared?.typographyCSS ?? '', 'Typography CSS')}
            >
              Copy typography CSS
            </Button>
            <Button
              variant="outline"
              disabled={!!prepared?.typographyCSSError}
              onClick={() =>
                download(prepared?.typographyCSS ?? '', 'radiant-typography.css', 'text/css')
              }
            >
              Download typography CSS
            </Button>
          </div>
          <label>
            Typography TypeScript output
            <textarea
              readOnly
              rows={12}
              wrap="off"
              value={prepared?.typographyTyped ?? ''}
            />
          </label>
          {prepared?.typographyCSSError && <p>{prepared.typographyCSSError}</p>}
          <label>
            Typography CSS output
            <textarea
              readOnly
              rows={12}
              wrap="off"
              value={prepared?.typographyCSS ?? ''}
            />
          </label>
        </details>
      </fieldset>
      <details className="handoff-setup">
        <summary>Required setup and fonts</summary>
        <p>
          Install the exact package versions below. Save the full typed output as{' '}
          <code>radiant-theme.ts</code> and the runtime setup beside it. Radiant includes the Motion
          engine; no separate engine installation is needed. A local candidate path requires its
          archive in the consuming app. Import matching compiled styles once; the reset is optional.
        </p>
        <div className="workshop-actions">
          <Button
            variant="outline"
            disabled={unavailable}
            aria-disabled={!!busy}
            onClick={() => void copy(prepared?.runtime.install ?? '', 'Install command')}
          >
            Copy install command
          </Button>
          <Button
            variant="outline"
            disabled={unavailable}
            aria-disabled={!!busy}
            onClick={() => void copy(prepared?.runtime.source ?? '', 'Runtime setup')}
          >
            Copy runtime setup
          </Button>
          <Button
            variant="outline"
            disabled={unavailable}
            onClick={() =>
              download(prepared?.runtime.source ?? '', 'RadiantMotion.tsx', 'text/typescript')
            }
          >
            Download runtime setup
          </Button>
        </div>
        <label>
          Install command
          <input
            type="text"
            readOnly
            value={prepared?.runtime.install ?? ''}
          />
        </label>
        <label>
          Runtime setup TypeScript output
          <textarea
            readOnly
            rows={14}
            wrap="off"
            value={prepared?.runtime.source ?? ''}
          />
        </label>
        <p>
          Font names and requirements travel with configurations and links. Font files stay local.
          Load the required fonts in the consuming app; exporting or importing a theme never loads a
          font file.
        </p>
        {fonts.length ? (
          <ul>
            {fonts.map(font => (
              <li key={font.id}>
                <strong>{font.family}</strong> · {font.source} · weights{' '}
                {font.weights.join(', ') || 'unspecified'} · styles{' '}
                {font.styles.join(', ') || 'unspecified'}
                <p>
                  Available axes:{' '}
                  {font.axes
                    .map(axis => `${axis.tag} ${axis.min}–${axis.max}, default ${axis.default}`)
                    .join('; ') || 'not verified'}
                  . Trial-only adjustments are not applied to the theme.
                </p>
                <p>{font.instruction}</p>
                {font.files.map(file => (
                  <span key={file.style}>
                    <a
                      href={file.url}
                      download
                    >
                      {file.style} WOFF2
                    </a>{' '}
                  </span>
                ))}
                {font.license && (
                  <a
                    href={font.license}
                    download
                  >
                    Font license
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No font descriptors are attached. Verify the chosen CSS families in your app.</p>
        )}
        <div className="workshop-actions">
          <Button
            variant="outline"
            disabled={unavailable}
            aria-disabled={!!busy}
            onClick={() => void copy(prepared?.setup ?? '', 'Font setup CSS')}
          >
            Copy font setup
          </Button>
          <Button
            variant="outline"
            disabled={unavailable}
            onClick={() => download(prepared?.setup ?? '', 'radiant-fonts.css', 'text/css')}
          >
            Download font setup
          </Button>
        </div>
        <label>
          Font setup CSS output
          <textarea
            readOnly
            rows={12}
            wrap="off"
            value={prepared?.setup ?? ''}
          />
        </label>
      </details>
      <fieldset disabled={unavailable}>
        <legend>Import JSON</legend>
        <p>
          A full theme or workshop configuration replaces the current theme and identity. Selective
          files apply the mode below while retaining other sections and component exceptions.
          Preview mode and specimen interactions stay unchanged. Recipe-free imported Color/Geometry
          values remain intact until you explicitly reset those editors. Reset preview restores the
          default workspace and clears its share fragment.
        </p>
        <label>
          Section apply mode
          <select
            value={applyMode}
            onChange={event => setApplyMode(event.target.value === 'replace' ? 'replace' : 'merge')}
          >
            <option value="merge">Merge supplied leaves</option>
            <option value="replace">Replace supplied sections</option>
          </select>
        </label>
        <label>
          Import configuration file
          <input
            type="file"
            aria-describedby={resultId}
            accept="application/json,.json"
            onChange={event => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (file) void importFile(file)
            }}
          />
        </label>
        <label>
          Configuration JSON
          <textarea
            rows={8}
            aria-describedby={resultId}
            value={input}
            onChange={event => setInput(event.target.value)}
          />
        </label>
        <Button onClick={() => importText(input)}>Import JSON</Button>
      </fieldset>
    </section>
  )
}
