'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Button } from '@cognitap/radiant'
import { WorkshopFontLoader } from './font-runtime'
import {
  applyTrialFont,
  curatedFonts,
  fontFamily,
  fontRecommendation,
  inspectLocalFont,
  localFont,
  type FontContext,
  type FontStyle,
  type TrialFont
} from './workshop-fonts'
import './font-editor.css'

type Metrics = { size: number; leading: number; tracking: number; measure: number }
const contexts: readonly FontContext[] = ['body', 'headings', 'ui', 'code']
const diagnostic = 'Árvíztűrő tükörfúrógép · Ελληνικά α Ω · Кириллица Ж ж · العربية ا · 漢字'
export function FontEditor({
  active,
  document,
  onChange
}: {
  active: boolean
  document: object
  onChange: (document: object) => void
}) {
  const [selected, setSelected] = useState('inter')
  const [custom, setCustom] = useState<TrialFont | null>(null)
  const [family, setFamily] = useState('Brand font')
  const [fileStyle, setFileStyle] = useState<FontStyle>('normal')
  const [fileWeight, setFileWeight] = useState(400)
  const [fileInfo, setFileInfo] = useState('')
  const [context, setContext] = useState<FontContext>('body')
  const [weight, setWeight] = useState(400)
  const [style, setStyle] = useState<FontStyle>('normal')
  const [axes, setAxes] = useState<Record<string, number>>({})
  const [optical, setOptical] = useState('auto')
  const [manual, setManual] = useState<Partial<Record<FontContext, Partial<Metrics>>>>({})
  const [text, setText] = useState(
    'Make room for the useful things.\n\nA clear thought needs space, a steady rhythm and a little contrast. Strong ideas deserve careful words; type makes those words feel at home.'
  )
  const [result, setLoad] = useState({
    key: '',
    state: 'idle',
    message: 'Open Typography to load the selected font.'
  })
  const [notice, setNotice] = useState('')
  const [retry, setRetry] = useState(0)
  const [localRevision, setLocalRevision] = useState(0)
  const loader = useRef<WorkshopFontLoader | null>(null)
  const bytes = useRef<ArrayBuffer | undefined>(undefined)
  const uploadRevision = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const font =
    selected === 'local' && custom
      ? custom
      : (curatedFonts.find(item => item.id === selected) ?? curatedFonts[0])
  const recommendation = fontRecommendation(font, context)
  const metrics = { ...recommendation, ...manual[context] }
  const unsupportedWeight = weight < font.weights[0] || weight > font.weights[1]
  const unsupportedStyle = !font.styles.includes(style)
  const requestKey = `${font.id}:${font.family}:${retry}:${localRevision}`
  const load =
    result.key === requestKey
      ? result
      : {
          state: 'loading',
          message: `Loading ${font.family}… fallback is visible until the files are ready.`
        }
  useEffect(() => {
    const next = new WorkshopFontLoader()
    loader.current = next
    return () => {
      next.dispose()
      loader.current = null
    }
  }, [])
  useEffect(() => {
    if (!active) return
    let cancelled = false
    loader
      .current!.load(font, font.source === 'local' ? bytes.current : undefined)
      .then(loaded => {
        if (!cancelled && loaded)
          setLoad({
            key: requestKey,
            state: 'loaded',
            message: `${font.family} loaded · ${font.styles.join(' + ')} · weights ${font.weights.join('–')}. Glyph fallback may still occur.`
          })
      })
      .catch(() => {
        if (!cancelled)
          setLoad({
            key: requestKey,
            state: 'failed',
            message: `${font.family} could not load. The sample uses ${font.fallback}. Retry or choose another font; your theme is unchanged.`
          })
      })
    return () => {
      cancelled = true
    }
  }, [active, font, requestKey])
  function select(id: string) {
    setSelected(id)
    setAxes({})
    setOptical('auto')
    setNotice('')
  }
  function editMetric(key: keyof Metrics, value: number, min: number, max: number) {
    if (Number.isFinite(value) && value >= min && value <= max)
      setManual(previous => ({ ...previous, [context]: { ...previous[context], [key]: value } }))
  }
  async function chooseFile(file: File | undefined) {
    if (!file) return
    const revision = ++uploadRevision.current
    const owner = loader.current
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('Choose a font file up to 10 MiB.')
      const buffer = await file.arrayBuffer()
      if (revision !== uploadRevision.current || loader.current !== owner) return
      const info = inspectLocalFont(buffer)
      const next = localFont(buffer, family, fileStyle, fileWeight)
      if (custom) loader.current!.remove(custom.family)
      bytes.current = buffer
      setCustom(next)
      setLocalRevision(value => value + 1)
      select('local')
      setWeight(info.axes.find(axis => axis.tag === 'wght')?.default ?? info.weight ?? fileWeight)
      setStyle(next.styles[0])
      setFileInfo(
        `${info.format}${info.family ? ` · file family ${info.family}` : ''}. ${info.format.startsWith('WOFF') ? 'Compressed metadata is not read here: declared file weight/style are manual and no axes are inferred.' : 'OpenType weight/style and variation axes read from this file.'}`
      )
      setNotice(
        'Local trial only. This file is held in memory, never uploaded or included in a theme.'
      )
    } catch (error) {
      if (revision === uploadRevision.current && loader.current === owner)
        setNotice(error instanceof Error ? error.message : 'Unable to read this font.')
    }
    if (fileInput.current) fileInput.current.value = ''
  }
  const variation = font.axes
    .filter(axis => !['wght', 'wdth', 'opsz'].includes(axis.tag))
    .map(axis => `"${axis.tag}" ${axes[axis.tag] ?? axis.default}`)
  if (optical === 'manual' && font.axes.some(axis => axis.tag === 'opsz'))
    variation.push(`"opsz" ${axes.opsz ?? font.axes.find(axis => axis.tag === 'opsz')!.default}`)
  const sample: CSSProperties = {
    fontFamily: load.state === 'loaded' ? fontFamily(font) : font.fallback,
    fontSize: `${metrics.size / 16}rem`,
    lineHeight: metrics.leading,
    letterSpacing: `${metrics.tracking}em`,
    maxInlineSize: metrics.measure ? `${metrics.measure}ch` : 'none',
    fontWeight: weight,
    fontStyle: style,
    fontOpticalSizing: optical === 'auto' ? 'auto' : 'none',
    fontStretch: `${axes.wdth ?? font.axes.find(axis => axis.tag === 'wdth')?.default ?? 100}%`,
    fontVariationSettings: variation.join(', ') || 'normal'
  }
  return (
    <div
      className="font-editor"
      data-font-state={load.state}
    >
      <div className="font-editor-heading">
        <h4>Try a typeface</h4>
        <p>
          Explore a studied family or bring your own font. Only “Use family in theme” changes the
          shared theme.
        </p>
      </div>
      <div className="font-controls">
        <label>
          Trial typeface
          <select
            value={font.id}
            onChange={event => select(event.target.value)}
          >
            {curatedFonts.map(item => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.family}
              </option>
            ))}
            {custom && <option value="local">{custom.family} · local</option>}
          </select>
        </label>
        <label>
          Trial context
          <select
            value={context}
            onChange={event => setContext(event.target.value as FontContext)}
          >
            {contexts.map(item => (
              <option
                key={item}
                value={item}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trial weight
          <input
            type="number"
            min="1"
            max="1000"
            value={weight}
            onChange={event => {
              const value = event.target.valueAsNumber
              if (Number.isFinite(value) && value >= 1 && value <= 1000) setWeight(value)
            }}
          />
        </label>
        <label>
          Trial style
          <select
            value={style}
            onChange={event => setStyle(event.target.value as FontStyle)}
          >
            {(['normal', 'italic'] as const).map(value => (
              <option
                key={value}
                value={value}
                disabled={!font.styles.includes(value)}
              >
                {value}
                {!font.styles.includes(value) ? ' · file missing' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
      <output className="font-status">{load.message}</output>
      {load.state === 'failed' && (
        <Button
          variant="outline"
          onClick={() => {
            loader.current!.remove(font.family)
            setRetry(value => value + 1)
          }}
        >
          Retry font
        </Button>
      )}
      <p>
        {recommendation.supported
          ? 'Studied starting point for this context.'
          : 'Uncalibrated font/context — tune manually and review the sample.'}{' '}
        Sizes are reference pixels at a 16px root; measure is a maximum, not a character count.
      </p>
      {(unsupportedWeight || unsupportedStyle) && (
        <p
          className="font-warning"
          role="alert"
        >
          {unsupportedWeight
            ? `Weight ${weight} is outside ${font.weights.join('–')}; the browser may choose a nearby weight. `
            : ''}
          {unsupportedStyle ? 'The selected style has no file. ' : ''}The requested setting is
          retained; it cannot be applied to the theme.
        </p>
      )}
      <div className="font-controls">
        <label>
          Sample size
          <input
            type="number"
            min="12"
            max="40"
            step="0.5"
            value={metrics.size}
            onChange={e => editMetric('size', e.target.valueAsNumber, 12, 40)}
          />
        </label>
        <label>
          Sample line height
          <input
            type="number"
            min="1"
            max="3"
            step="0.05"
            value={metrics.leading}
            onChange={e => editMetric('leading', e.target.valueAsNumber, 1, 3)}
          />
        </label>
        <label>
          Sample tracking (em)
          <input
            type="number"
            min="-0.2"
            max="0.5"
            step="0.01"
            value={metrics.tracking}
            onChange={e => editMetric('tracking', e.target.valueAsNumber, -0.2, 0.5)}
          />
        </label>
        <label>
          Sample measure (ch)
          <input
            type="number"
            min="0"
            max="120"
            value={metrics.measure}
            onChange={e => editMetric('measure', e.target.valueAsNumber, 0, 120)}
          />
        </label>
      </div>
      <Button
        variant="outline"
        onClick={() =>
          setManual(previous => {
            const next = { ...previous }
            delete next[context]
            return next
          })
        }
      >
        Reset context sample
      </Button>
      <fieldset className="font-axes">
        <legend>Available axes</legend>
        <p>
          Weight uses the weight field above. Other controls appear only for axes verified in the
          chosen files. Width stays at its real 100% design by default.
        </p>
        {font.axes.some(axis => axis.tag === 'opsz') && (
          <label>
            Optical sizing
            <select
              value={optical}
              onChange={e => setOptical(e.target.value)}
            >
              <option value="auto">Automatic · follow text size</option>
              <option value="manual">Manual optical size</option>
            </select>
          </label>
        )}
        {font.axes
          .filter(axis => axis.tag !== 'wght' && (axis.tag !== 'opsz' || optical === 'manual'))
          .map(axis => (
            <label key={axis.tag}>
              {axis.tag} · {axis.min}–{axis.max}
              <input
                type="number"
                min={axis.min}
                max={axis.max}
                step="0.1"
                value={axes[axis.tag] ?? axis.default}
                onChange={e => {
                  const value = e.target.valueAsNumber
                  if (Number.isFinite(value) && value >= axis.min && value <= axis.max)
                    setAxes(previous => ({ ...previous, [axis.tag]: value }))
                }}
              />
            </label>
          ))}
        {font.axes.filter(axis => axis.tag !== 'wght').length === 0 && (
          <p>No additional verified axes. Optical sizing does not create an optical axis.</p>
        )}
      </fieldset>
      <label>
        Sample copy
        <textarea
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </label>
      <div
        className="font-sample"
        data-testid="font-sample"
        style={sample}
      >
        <p>{text}</p>
        <p>
          <strong>Strong ideas.</strong> <em>Real italic when available.</em> 0123456789 · 0O 1Il
        </p>
        <p lang="und">{diagnostic}</p>
      </div>
      <p>
        {font.coverage} Italic script coverage has not been separately verified. A loaded face does
        not prove every glyph avoids fallback.
      </p>
      {font.license && (
        <p>
          <a href={font.license}>Full SIL Open Font License</a> · pinned, unmodified font files
          hosted by this site.
        </p>
      )}
      <Button
        disabled={
          load.state !== 'loaded' ||
          unsupportedWeight ||
          unsupportedStyle ||
          !font.styles.includes('normal')
        }
        onClick={() => {
          try {
            onChange(applyTrialFont(document, font, weight))
            setNotice(
              `${font.family} and weight ${weight} applied. Sample rhythm/axes stay local; other theme settings are retained.`
            )
          } catch (error) {
            setNotice(error instanceof Error ? error.message : 'Unable to apply this font.')
          }
        }}
      >
        Use family in theme
      </Button>
      <details className="font-local">
        <summary>Try a local font file</summary>
        <p>
          Files stay in memory for this workshop session. Choose WOFF2, WOFF, TTF or OTF, up to 10
          MiB. Collections are unsupported. Reloading or resetting the preview discards local files;
          recipients must provide their own copies.
        </p>
        <div className="font-controls">
          <label>
            Local CSS family
            <input
              value={family}
              maxLength={80}
              onChange={e => setFamily(e.target.value)}
            />
          </label>
          <label>
            Declared file weight
            <input
              type="number"
              min="1"
              max="1000"
              value={fileWeight}
              onChange={e => {
                const value = e.target.valueAsNumber
                if (Number.isFinite(value) && value >= 1 && value <= 1000) setFileWeight(value)
              }}
            />
          </label>
          <label>
            Declared file style
            <select
              value={fileStyle}
              onChange={e => setFileStyle(e.target.value as FontStyle)}
            >
              <option value="normal">normal</option>
              <option value="italic">italic</option>
            </select>
          </label>
        </div>
        <p>
          Family is the CSS name you will use in your app. For compressed web fonts, declare the
          actual file weight/style before choosing a file. Use TTF/OTF to inspect available variable
          axes. An italic file alone is trial-only; the shared theme needs a normal face.
        </p>
        <label>
          Local font file
          <input
            ref={fileInput}
            type="file"
            accept=".woff2,.woff,.ttf,.otf"
            onChange={e => void chooseFile(e.target.files?.[0])}
          />
        </label>
        <p>{fileInfo}</p>
        {custom && (
          <Button
            variant="outline"
            onClick={() => {
              ++uploadRevision.current
              loader.current!.remove(custom.family)
              bytes.current = undefined
              setCustom(null)
              setFileInfo('')
              select('inter')
              setNotice(
                'Local file removed. A theme referencing it keeps its requirement and uses fallback until that font is provided again.'
              )
            }}
          >
            Remove local font
          </Button>
        )}
      </details>
      <output className="font-notice">{notice}</output>
    </div>
  )
}
