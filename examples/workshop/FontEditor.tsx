'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  Input,
  Link,
  NativeSelect,
  Textarea
} from '@cognitap/radiant'
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
import { ScrubField } from './ScrubField'
import { FaceCards } from './TypographyPickers'
import { trialFace, type Scrub } from './workshop-typography-view'
import './font-editor.css'

type Metrics = { size: number; leading: number; tracking: number; measure: number }
const contexts: readonly FontContext[] = ['body', 'headings', 'ui', 'code']
const diagnostic = 'Árvíztűrő tükörfúrógép · Ελληνικά α Ω · Кириллица Ж ж · العربية ا · 漢字'
const scrub = (
  name: string,
  label: string,
  min: number,
  max: number,
  step: number,
  unit = ''
): Scrub => ({
  key: name,
  name,
  label,
  min,
  max,
  step,
  unit
})
const sampleScrubs: readonly (Scrub & { key: keyof Metrics })[] = [
  { ...scrub('Sample size', 'Size', 12, 40, 0.5, 'px'), key: 'size' },
  { ...scrub('Sample line height', 'Leading', 1, 3, 0.05), key: 'leading' },
  { ...scrub('Sample tracking (em)', 'Tracking', -0.2, 0.5, 0.01, 'em'), key: 'tracking' },
  { ...scrub('Sample measure (ch)', 'Measure', 0, 120, 1, 'ch'), key: 'measure' }
]
const weightScrub = scrub('Trial weight', 'Weight', 1, 1000, 1)
const fileWeightScrub = scrub('Declared file weight', 'File weight', 1, 1000, 1)

export function FontEditor({
  active,
  document,
  onChange,
  onSession,
  onLocalReady,
  onAssignFont
}: {
  active: boolean
  document: object
  onChange: (document: object) => void
  onSession?: (loader: WorkshopFontLoader | null) => void
  onLocalReady?: (font: TrialFont | null) => void
  onAssignFont: (document: object, font: TrialFont, context: FontContext) => object
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
  const watchers = useRef(new Set<() => void>())
  const bytes = useRef<ArrayBuffer | undefined>(undefined)
  const uploadRevision = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const seen = useRef<{ version: number; loader: WorkshopFontLoader | null }>({
    version: -1,
    loader: null
  })
  /** The faces the sample and the cards may draw in: the session loader at its current version. */
  const session = useSyncExternalStore(
    listener => {
      watchers.current.add(listener)
      return () => watchers.current.delete(listener)
    },
    () => {
      const current = loader.current
      const version = current?.snapshot() ?? 0
      if (seen.current.loader !== current || seen.current.version !== version)
        seen.current = { version, loader: current }
      return seen.current
    },
    () => seen.current
  ).loader
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
    const unsubscribe = next.subscribe(() => {
      for (const listener of watchers.current) listener()
    })
    onSession?.(next)
    return () => {
      unsubscribe()
      next.dispose()
      loader.current = null
      onSession?.(null)
      onLocalReady?.(null)
    }
  }, [onSession, onLocalReady])
  useEffect(() => {
    if (!active) return
    let cancelled = false
    loader
      .current!.load(font, font.source === 'local' ? bytes.current : undefined)
      .then(loaded => {
        if (!cancelled && loaded) {
          if (font.source === 'local') onLocalReady?.(font)
          setLoad({
            key: requestKey,
            state: 'loaded',
            message: `${font.family} loaded · ${font.styles.join(' + ')} · weights ${font.weights.join('–')}.`
          })
        }
      })
      .catch(() => {
        if (!cancelled)
          setLoad({
            key: requestKey,
            state: 'failed',
            message: `${font.family} could not load. The sample uses ${font.fallback}; retry or choose another font.`
          })
      })
    return () => {
      cancelled = true
    }
  }, [active, font, requestKey, onLocalReady])
  function select(id: string) {
    setSelected(id)
    setAxes({})
    setOptical('auto')
    setNotice('')
  }
  function editMetric(key: keyof Metrics, value: number) {
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
      onLocalReady?.(null)
      bytes.current = buffer
      setCustom(next)
      setLocalRevision(value => value + 1)
      select('local')
      setWeight(info.axes.find(axis => axis.tag === 'wght')?.default ?? info.weight ?? fileWeight)
      setStyle(next.styles[0])
      setFileInfo(
        `${info.format}${info.family ? ` · file family ${info.family}` : ''} · ${info.format.startsWith('WOFF') ? 'declared weight/style used, no axes are inferred' : 'weight, style and axes read from the file'}.`
      )
      setNotice('Local trial only: held in memory, never uploaded or included in a theme.')
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
  const options = [...curatedFonts, ...(custom ? [custom] : [])].map(item => ({
    value: item.id,
    name: item.family,
    faces: [trialFace(item, session)],
    note: item.source === 'local' ? 'local' : undefined
  }))
  const extraAxes = font.axes.filter(
    axis => axis.tag !== 'wght' && (axis.tag !== 'opsz' || optical === 'manual')
  )
  return (
    <div
      className="font-editor"
      data-font-state={load.state}
    >
      <div
        className="font-sample"
        data-testid="font-sample"
        data-face={load.state === 'loaded' ? undefined : load.state}
        style={sample}
      >
        <p>{text}</p>
        <p>
          <strong>Strong ideas.</strong> <em>Real italic when available.</em> 0123456789 · 0O 1Il
        </p>
        <p lang="und">{diagnostic}</p>
      </div>
      <div className="font-status-row">
        <output className="font-status">{load.message}</output>
        <Badge tone={recommendation.supported ? 'neutral' : 'warning'}>
          {recommendation.supported
            ? `Studied for ${context}`
            : `Uncalibrated for ${context} · manual metrics`}
        </Badge>
        {load.state === 'failed' && (
          <Button
            variant="outline"
            controlSize="small"
            onClick={() => {
              loader.current!.remove(font.family)
              setRetry(value => value + 1)
            }}
          >
            Retry font
          </Button>
        )}
      </div>
      <FaceCards
        label="Trial typeface"
        options={options}
        value={font.id}
        onChange={select}
      />
      <div className="font-controls">
        <Field label="Trial context">
          <NativeSelect
            controlSize="small"
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
          </NativeSelect>
        </Field>
        <Field label="Trial style">
          <NativeSelect
            controlSize="small"
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
          </NativeSelect>
        </Field>
        <ScrubField
          scrub={weightScrub}
          value={weight}
          onChange={setWeight}
        />
        {font.axes.some(axis => axis.tag === 'opsz') && (
          <Field label="Optical sizing">
            <NativeSelect
              controlSize="small"
              value={optical}
              onChange={e => setOptical(e.target.value)}
            >
              <option value="auto">Automatic</option>
              <option value="manual">Manual optical size</option>
            </NativeSelect>
          </Field>
        )}
        {extraAxes.map(axis => (
          <ScrubField
            key={axis.tag}
            scrub={scrub(
              `${axis.tag} · ${axis.min}–${axis.max}`,
              axis.tag,
              axis.min,
              axis.max,
              0.1
            )}
            value={axes[axis.tag] ?? axis.default}
            onChange={value => setAxes(previous => ({ ...previous, [axis.tag]: value }))}
          />
        ))}
      </div>
      {(unsupportedWeight || unsupportedStyle) && (
        <Alert
          tone="danger"
          announce="assertive"
        >
          <AlertDescription>
            {unsupportedWeight
              ? `Weight ${weight} is outside ${font.weights.join('–')}; the browser may use a nearby weight. `
              : ''}
            {unsupportedStyle ? 'The selected style has no file. ' : ''}
            It cannot be applied to the theme.
          </AlertDescription>
        </Alert>
      )}
      <div className="font-controls">
        {sampleScrubs.map(item => (
          <ScrubField
            key={item.key}
            scrub={item}
            value={metrics[item.key]}
            onChange={value => editMetric(item.key, value)}
          />
        ))}
        <Button
          variant="outline"
          className="font-reset"
          controlSize="small"
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
      </div>
      <div className="font-actions">
        <Button
          disabled={
            load.state !== 'loaded' ||
            unsupportedWeight ||
            unsupportedStyle ||
            !font.styles.includes('normal')
          }
          onClick={() => {
            try {
              const next = applyTrialFont(document, font, weight)
              onChange(onAssignFont(next, font, context))
              setNotice(`${font.family} assigned to ${context}.`)
            } catch (error) {
              setNotice(error instanceof Error ? error.message : 'Unable to apply this font.')
            }
          }}
        >
          Use family in theme
        </Button>
        {font.license && (
          <Link
            variant="subtle"
            href={font.license}
          >
            SIL Open Font License
          </Link>
        )}
      </div>
      <Collapsible>
        <CollapsibleTrigger>Sample copy</CollapsibleTrigger>
        <CollapsibleContent className="font-collapse">
          <Field label="Sample copy">
            <Textarea
              controlSize="small"
              rows={3}
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </Field>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger>Try a local font file</CollapsibleTrigger>
        <CollapsibleContent className="font-collapse">
          <div className="font-controls">
            <Field label="Local CSS family">
              <Input
                controlSize="small"
                value={family}
                maxLength={80}
                onChange={e => setFamily(e.target.value)}
              />
            </Field>
            <ScrubField
              scrub={fileWeightScrub}
              value={fileWeight}
              onChange={setFileWeight}
            />
            <Field label="Declared file style">
              <NativeSelect
                controlSize="small"
                value={fileStyle}
                onChange={e => setFileStyle(e.target.value as FontStyle)}
              >
                <option value="normal">normal</option>
                <option value="italic">italic</option>
              </NativeSelect>
            </Field>
          </div>
          <Field label="Local font file">
            {control => (
              // oxlint-disable-next-line react/forbid-elements -- Radiant has no file input yet.
              <input
                {...control}
                ref={fileInput}
                type="file"
                accept=".woff2,.woff,.ttf,.otf"
                onChange={e => void chooseFile(e.target.files?.[0])}
              />
            )}
          </Field>
          <span className="font-file-info">
            {fileInfo || 'WOFF2, WOFF, TTF or OTF up to 10 MiB, kept in memory for this session.'}
          </span>
          {custom && (
            <Button
              variant="outline"
              onClick={() => {
                ++uploadRevision.current
                loader.current!.remove(custom.family)
                onLocalReady?.(null)
                bytes.current = undefined
                setCustom(null)
                setFileInfo('')
                select('inter')
                setNotice(
                  'Local file removed. A theme referencing it falls back until it is provided again.'
                )
              }}
            >
              Remove local font
            </Button>
          )}
        </CollapsibleContent>
      </Collapsible>
      <output className="font-notice">{notice}</output>
    </div>
  )
}
