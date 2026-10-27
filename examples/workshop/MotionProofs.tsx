'use client'

import { useEffect, useId, useMemo, useRef, useState, type RefObject } from 'react'
import {
  Button,
  Card,
  CardTitle,
  CardDescription,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  ThemeScope,
  type ThemeMode
} from '@cognitap/radiant'
import { bindSpringStyle } from '@cognitap/radiant/motion'
import {
  MotionProvider,
  useReducedMotion,
  useSpring,
  useSpringDrag,
  useSpringFollow,
  useSpringLayout
} from '@cognitap/radiant/motion/react'
import { MotionInspector, type MotionReader } from './MotionInspector'
import { motionPreview, type MotionTreatment } from './workshop-motion'
import './motion-editor.css'

type Proof = 'actions' | 'drag' | 'follow' | 'layout'
const proofs: readonly { id: Proof; label: string }[] = [
  { id: 'actions', label: 'Press & disclose' },
  { id: 'drag', label: 'Drag & snap' },
  { id: 'follow', label: 'Moving target' },
  { id: 'layout', label: 'Resize & reorder' }
]
interface Session {
  actions: { count: number; open: boolean; expanded: boolean }
  drag: { target: number }
  follow: { target: number; running: boolean }
  layout: { order: string[]; wide: boolean; expanded: boolean }
}
const initialSession = (): Session => ({
  actions: { count: 0, open: false, expanded: false },
  drag: { target: 0 },
  follow: { target: 80, running: false },
  layout: { order: ['Files', 'People', 'Archive'], wide: true, expanded: false }
})
type Replay = RefObject<(() => void) | null>
type Update = <K extends Proof>(proof: K, value: Session[K]) => void

function useTravel(track: RefObject<HTMLElement | null>, handle: RefObject<HTMLElement | null>) {
  const [extent, setExtent] = useState(160)
  useEffect(() => {
    if (!track.current || !handle.current) return
    const measure = () =>
      setExtent(Math.max(1, track.current!.clientWidth - handle.current!.offsetWidth))
    const observer = new ResizeObserver(measure)
    observer.observe(track.current)
    observer.observe(handle.current)
    measure()
    return () => observer.disconnect()
  }, [track, handle])
  return extent
}

function ActionProof({
  model,
  onChange,
  sourceRef,
  replayRef
}: {
  model: Session['actions']
  onChange: (next: Session['actions']) => void
  sourceRef: RefObject<MotionReader | null>
  replayRef: Replay
}) {
  const button = useRef<HTMLButtonElement>(null)
  const details = useRef<HTMLDetailsElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [metric, setMetric] = useState('press')
  useEffect(() => {
    sourceRef.current = () => {
      if (metric === 'press' && button.current)
        return {
          position: parseFloat(getComputedStyle(button.current).scale) || 1,
          label: 'Rendered button scale',
          unit: ''
        }
      if (details.current && content.current)
        return {
          position: parseFloat(getComputedStyle(details.current, '::details-content').height) || 0,
          target: model.open ? content.current.getBoundingClientRect().height : 0,
          label: 'Rendered disclosure height',
          unit: 'px'
        }
      return null
    }
    return () => {
      sourceRef.current = null
    }
  }, [metric, model.open, sourceRef])
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const release = () =>
      button.current?.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', button: 0 })
      )
    replayRef.current = () => {
      clearTimeout(timer)
      if (metric === 'disclosure') {
        onChange({ ...model, open: !model.open })
        return
      }
      release()
      button.current?.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          pointerType: 'mouse',
          button: 0,
          isPrimary: true
        })
      )
      timer = setTimeout(release, 120)
    }
    return () => {
      clearTimeout(timer)
      release()
      replayRef.current = null
    }
  }, [replayRef, metric, model, onChange])
  return (
    <div className="motion-scene motion-actions-proof">
      <p>Press again during rebound. Click, touch, Enter and Space use the real Button.</p>
      <Button
        ref={button}
        onClick={() => onChange({ ...model, count: model.count + 1 })}
      >
        Press me
      </Button>
      <output className="motion-action-count">
        Activated {model.count} {model.count === 1 ? 'time' : 'times'}
      </output>
      <Collapsible
        ref={details}
        open={model.open}
        onOpenChange={open => onChange({ ...model, open })}
      >
        <CollapsibleTrigger>Open and reverse this disclosure</CollapsibleTrigger>
        <CollapsibleContent ref={content}>
          <p>Change direction before the height settles. Content and controls remain real.</p>
          {model.expanded && (
            <p>
              More content changes the measured destination. Keep opening and closing while it
              moves.
            </p>
          )}
          <Button
            variant="outline"
            controlSize="small"
            onClick={() => onChange({ ...model, expanded: !model.expanded })}
          >
            Change content
          </Button>
        </CollapsibleContent>
      </Collapsible>
      <Dialog>
        <DialogTrigger variant="outline">Try a modal</DialogTrigger>
        <DialogContent>
          <DialogTitle>Native modal, spring presentation</DialogTitle>
          <p>Escape closes the modal and returns focus immediately.</p>
          <DialogClose>Close modal</DialogClose>
        </DialogContent>
      </Dialog>
      <label>
        Inspect action
        <select
          value={metric}
          onChange={event => setMetric(event.target.value)}
        >
          <option value="press">Button scale</option>
          <option value="disclosure">Disclosure height</option>
        </select>
      </label>
      <p className="motion-fine-print">
        Replay samples press feedback without activating the action. Action velocity is measured
        from rendered presentation.
      </p>
    </div>
  )
}

function DragProof({
  model,
  onChange,
  sourceRef,
  replayRef
}: {
  model: Session['drag']
  onChange: (next: Session['drag']) => void
  sourceRef: RefObject<MotionReader | null>
  replayRef: Replay
}) {
  const track = useRef<HTMLDivElement>(null),
    handle = useRef<HTMLButtonElement>(null)
  const extent = useTravel(track, handle)
  const drag = useSpringDrag(handle, Math.min(160, model.target), {
    min: 0,
    max: extent,
    snapPoints: [0, extent / 2, extent]
  })
  const latest = useRef(model)
  const id = useId()
  useEffect(() => {
    drag.to(Math.min(extent, model.target))
  }, [drag, extent, model.target])
  useEffect(() => {
    latest.current = model
  }, [model])
  useEffect(() => {
    sourceRef.current = () => ({
      position: drag.get(),
      velocity: drag.getVelocity(),
      moving: drag.isAnimating(),
      label: 'Drag handle position',
      unit: 'px'
    })
    replayRef.current = () => drag.to(drag.get() < extent / 2 ? extent : 0)
    let frame: number
    const commit = () => {
      cancelAnimationFrame(frame)
      const settle = () => {
        if (drag.isAnimating()) frame = requestAnimationFrame(settle)
        else if (drag.get() !== latest.current.target) onChange({ target: drag.get() })
      }
      frame = requestAnimationFrame(settle)
    }
    document.addEventListener('pointerup', commit)
    document.addEventListener('touchend', commit)
    document.addEventListener('keyup', commit)
    return () => {
      sourceRef.current = null
      replayRef.current = null
      cancelAnimationFrame(frame)
      document.removeEventListener('pointerup', commit)
      document.removeEventListener('touchend', commit)
      document.removeEventListener('keyup', commit)
    }
  }, [drag, extent, onChange, replayRef, sourceRef])
  function to(target: number) {
    drag.to(target)
    onChange({ target })
  }
  return (
    <div className="motion-scene">
      <p>
        Release with speed, catch it mid-flight, or use arrows, Home, End and Escape. Vertical touch
        scrolling stays available.
      </p>
      <div
        ref={track}
        className="motion-track motion-drag-track"
      >
        <div
          className="motion-snap-markers"
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </div>
        <Button
          ref={handle}
          className="motion-drag-handle"
          controlSize="small"
          aria-describedby={id}
        >
          Drag
        </Button>
      </div>
      <p
        id={id}
        className="motion-fine-print"
      >
        Drag sideways. Start, Middle and End provide the same destinations without dragging.
      </p>
      <div className="motion-inline-actions">
        <Button
          variant="outline"
          controlSize="small"
          onClick={() => to(0)}
        >
          Start
        </Button>
        <Button
          variant="outline"
          controlSize="small"
          onClick={() => to(extent / 2)}
        >
          Middle
        </Button>
        <Button
          variant="outline"
          controlSize="small"
          onClick={() => to(extent)}
        >
          End
        </Button>
      </div>
      <label>
        Manual destination
        <input
          type="range"
          min={0}
          max={extent}
          step="any"
          value={Math.min(extent, model.target)}
          onChange={event => to(Number(event.target.value))}
        />
      </label>
    </div>
  )
}

function FollowProof({
  model,
  onChange,
  sourceRef,
  replayRef
}: {
  model: Session['follow']
  onChange: (next: Session['follow']) => void
  sourceRef: RefObject<MotionReader | null>
  replayRef: Replay
}) {
  const track = useRef<HTMLDivElement>(null),
    destination = useRef<HTMLSpanElement>(null),
    marker = useRef<HTMLSpanElement>(null)
  const extent = useTravel(track, marker)
  const target = useSpring(model.target)
  const follower = useSpringFollow(target)
  useEffect(() => {
    target.jump(Math.min(extent, model.target))
  }, [model.target, target, extent])
  useEffect(() => {
    if (!destination.current || !marker.current) return
    const a = bindSpringStyle(destination.current, target, 'translateX')
    const b = bindSpringStyle(marker.current, follower, 'translateX')
    return () => {
      a()
      b()
    }
  }, [target, follower])
  useEffect(() => {
    sourceRef.current = () => ({
      position: follower.get(),
      target: target.get(),
      velocity: follower.getVelocity(),
      moving: follower.isAnimating(),
      unit: 'px',
      label: 'Following position'
    })
    replayRef.current = () =>
      onChange({ target: target.get() < extent / 2 ? extent : 0, running: false })
    return () => {
      sourceRef.current = null
      replayRef.current = null
    }
  }, [follower, target, extent, onChange, sourceRef, replayRef])
  useEffect(() => {
    if (!model.running) return
    let frame: number
    const start = performance.now()
    function tick(now: number) {
      target.jump(extent / 2 + Math.sin((now - start) / 400) * Math.max(0, extent / 2 - 8))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [model.running, target, extent])
  return (
    <div className="motion-scene">
      <p>
        The outlined marker is the destination. The filled marker follows it. Move across the track
        or interrupt with the slider.
      </p>
      <div
        ref={track}
        className="motion-track motion-follow-track"
        onPointerMove={event => {
          onChange({
            target: Math.max(
              0,
              Math.min(
                extent,
                event.clientX - event.currentTarget.getBoundingClientRect().left - 12
              )
            ),
            running: false
          })
        }}
      >
        <span
          ref={destination}
          className="motion-target-marker"
          aria-hidden="true"
        />
        <span
          ref={marker}
          className="motion-follow-marker"
          aria-hidden="true"
        />
      </div>
      <label>
        Manual destination
        <input
          type="range"
          min={0}
          max={extent}
          step="any"
          value={Math.min(extent, model.target)}
          onChange={event => onChange({ target: Number(event.target.value), running: false })}
        />
      </label>
      <Button
        variant="outline"
        aria-pressed={model.running}
        onClick={() => onChange({ ...model, running: !model.running })}
      >
        {model.running ? 'Pause moving target' : 'Start moving target'}
      </Button>
    </div>
  )
}

function LayoutProof({
  model,
  onChange,
  sourceRef,
  replayRef
}: {
  model: Session['layout']
  onChange: (next: Session['layout']) => void
  sourceRef: RefObject<MotionReader | null>
  replayRef: Replay
}) {
  const root = useRef<HTMLDivElement>(null),
    first = useRef<HTMLDivElement>(null)
  const layout = useSpringLayout(root)
  const [metric, setMetric] = useState<'y' | 'width' | 'height'>('width')
  useEffect(() => {
    sourceRef.current = () => {
      if (!root.current || !first.current) return null
      const bounds = layout.get(first.current),
        velocity = layout.getVelocity(first.current)
      const natural = first.current.getBoundingClientRect(),
        origin = root.current.getBoundingClientRect()
      return bounds
        ? {
            position: bounds[metric],
            target:
              metric === 'y'
                ? natural.top - origin.top - root.current.clientTop + root.current.scrollTop
                : natural[metric],
            velocity: velocity?.[metric],
            moving: layout.isAnimating(),
            unit: 'px',
            label: `Files card · ${metric}`
          }
        : null
    }
    replayRef.current = () =>
      onChange({ ...model, order: [...model.order.slice(1), model.order[0]!] })
    return () => {
      sourceRef.current = null
      replayRef.current = null
    }
  }, [layout, metric, model, onChange, sourceRef, replayRef])
  return (
    <div className="motion-scene">
      <p>
        Resize, reorder or change content while the cards move. Text reflows and borders keep their
        thickness.
      </p>
      <div className="motion-inline-actions">
        <Button
          variant="outline"
          controlSize="small"
          onClick={() => onChange({ ...model, wide: !model.wide })}
        >
          Resize cards
        </Button>
        <Button
          variant="outline"
          controlSize="small"
          onClick={() => replayRef.current?.()}
        >
          Reorder cards
        </Button>
        <Button
          variant="outline"
          controlSize="small"
          onClick={() => onChange({ ...model, expanded: !model.expanded })}
        >
          Change content
        </Button>
      </div>
      <div className="motion-layout-scroll">
        <div
          ref={root}
          className="motion-layout-root"
          style={{ width: model.wide ? '100%' : '82%' }}
        >
          {model.order.map(name => (
            <div
              key={name}
              ref={name === 'Files' ? first : undefined}
              data-rad-layout-slot=""
              className="motion-layout-slot"
            >
              <Card
                data-rad-layout-part=""
                className="motion-layout-part"
              >
                <CardTitle level={5}>{name}</CardTitle>
                <CardDescription>
                  {model.expanded
                    ? 'Content can change during motion. Repeatedly interrupt the same layout to inspect its response.'
                    : 'Real content, natural layout.'}
                </CardDescription>
                <Button
                  controlSize="small"
                  variant="outline"
                  onClick={() =>
                    onChange({
                      ...model,
                      order: [...model.order.filter(item => item !== name), name]
                    })
                  }
                >
                  Move
                </Button>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <label>
        Inspect coordinate
        <select
          value={metric}
          onChange={event => {
            const next = event.target.value
            if (next === 'y' || next === 'width' || next === 'height') setMetric(next)
          }}
        >
          <option value="width">Card width</option>
          <option value="height">Card height</option>
          <option value="y">Card vertical position</option>
        </select>
      </label>
    </div>
  )
}

function MotionFrame({
  document,
  mode,
  treatment,
  title,
  proof,
  session,
  update,
  revision,
  onReset,
  replayRef
}: {
  document: object
  mode: ThemeMode
  treatment: MotionTreatment
  title: string
  proof: Proof
  session: Session
  update: Update
  revision: number
  onReset: () => void
  replayRef: Replay
}) {
  const theme = useMemo(() => motionPreview(document, treatment), [document, treatment])
  const reduced = useReducedMotion()
  const sourceRef = useRef<MotionReader | null>(null)
  return (
    <section
      className="motion-frame"
      aria-label={`${title} motion example`}
    >
      <header className="motion-frame-heading">
        <div>
          <h4>{title}</h4>
          <span>
            {theme.motion.mode === 'off' || reduced ? 'Spatial motion off' : 'Spring motion active'}
            {reduced ? ' · system reduced motion' : ''}
          </span>
        </div>
        <div className="motion-inline-actions">
          <Button
            variant="outline"
            controlSize="small"
            onClick={() => replayRef.current?.()}
          >
            Replay
          </Button>
          <Button
            variant="ghost"
            controlSize="small"
            onClick={onReset}
          >
            Reset example
          </Button>
        </div>
      </header>
      <ThemeScope
        theme={theme}
        mode={mode}
        className="motion-stage"
      >
        <MotionProvider>
          <div key={`${proof}:${revision}`}>
            {proof === 'actions' ? (
              <ActionProof
                model={session.actions}
                onChange={value => update('actions', value)}
                sourceRef={sourceRef}
                replayRef={replayRef}
              />
            ) : proof === 'drag' ? (
              <DragProof
                model={session.drag}
                onChange={value => update('drag', value)}
                sourceRef={sourceRef}
                replayRef={replayRef}
              />
            ) : proof === 'follow' ? (
              <FollowProof
                model={session.follow}
                onChange={value => update('follow', value)}
                sourceRef={sourceRef}
                replayRef={replayRef}
              />
            ) : (
              <LayoutProof
                model={session.layout}
                onChange={value => update('layout', value)}
                sourceRef={sourceRef}
                replayRef={replayRef}
              />
            )}
          </div>
        </MotionProvider>
      </ThemeScope>
      <MotionInspector
        key={`${proof}:${revision}`}
        sourceRef={sourceRef}
      />
    </section>
  )
}

export function MotionProofs({
  active,
  document,
  mode,
  onModeChange
}: {
  active: boolean
  document: object
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
}) {
  const [proof, setProof] = useState<Proof>('actions')
  const [comparison, setComparison] = useState('current')
  const [width, setWidth] = useState('full')
  const [sessions, setSessions] = useState(() => ({
    primary: initialSession(),
    secondary: initialSession()
  }))
  const [revisions, setRevisions] = useState<Record<string, number>>({})
  const primary = useRef<(() => void) | null>(null),
    secondary = useRef<(() => void) | null>(null)
  const reduced = useReducedMotion()
  if (!active) return null
  const frames: { slot: 'primary' | 'secondary'; treatment: MotionTreatment; title: string }[] =
    comparison === 'character'
      ? [
          { slot: 'primary', treatment: 'restrained', title: 'Restrained' },
          { slot: 'secondary', treatment: 'expressive', title: 'Expressive' }
        ]
      : [
          { slot: 'primary', treatment: 'current', title: 'Your theme' },
          ...(comparison === 'current'
            ? []
            : [
                {
                  slot: 'secondary' as const,
                  treatment: comparison === 'reduced' ? ('reduced' as const) : ('off' as const),
                  title: comparison === 'reduced' ? 'Reduced motion preview' : 'Motion off'
                }
              ])
        ]
  function update<K extends Proof>(slot: 'primary' | 'secondary', key: K, value: Session[K]) {
    setSessions(previous => ({ ...previous, [slot]: { ...previous[slot], [key]: value } }))
  }
  return (
    <section
      className="motion-proofs"
      aria-label="Motion proof bench"
      data-motion-proof={proof}
    >
      <header>
        <p className="motion-eyebrow">Try, interrupt, inspect</p>
        <h3>Feel the profile</h3>
        <p>
          Every example uses the same production springs as your theme. Comparison frames keep their
          own interaction state.
        </p>
      </header>
      <nav
        className="motion-proof-nav"
        aria-label="Motion examples"
      >
        {proofs.map(item => (
          <Button
            key={item.id}
            variant={item.id === proof ? 'solid' : 'outline'}
            aria-pressed={item.id === proof}
            onClick={() => setProof(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="motion-toolbar">
        <label>
          Comparison
          <select
            value={comparison}
            onChange={event => setComparison(event.target.value)}
          >
            <option value="current">Your theme</option>
            <option value="character">Restrained + Expressive</option>
            <option value="off">Your theme + Motion off</option>
            <option value="reduced">Your theme + Reduced motion</option>
          </select>
        </label>
        <label>
          Motion preview mode
          <select
            value={mode}
            onChange={event => {
              const next = event.target.value
              if (next === 'light' || next === 'dark' || next === 'system') onModeChange(next)
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </label>
        <label>
          Motion frame width
          <select
            value={width}
            onChange={event => setWidth(event.target.value)}
          >
            <option value="full">Available width</option>
            <option value="phone">Phone · up to 320px</option>
          </select>
        </label>
        <Button
          variant="outline"
          onClick={() => {
            primary.current?.()
            secondary.current?.()
          }}
        >
          {frames.length > 1 ? 'Replay both' : 'Replay example'}
        </Button>
      </div>
      <p className="motion-preference">
        System preference: <strong>{reduced ? 'Reduce motion' : 'No preference'}</strong>.
        Reduced-motion preview uses the runtime’s spatial-off policy without changing your theme.
        System preference always applies.
      </p>
      <div
        className="motion-frames"
        data-motion-width={width}
      >
        {frames.map(frame => (
          <MotionFrame
            key={frame.slot}
            document={document}
            mode={mode}
            treatment={frame.treatment}
            title={frame.title}
            proof={proof}
            session={sessions[frame.slot]}
            update={(key, value) => update(frame.slot, key, value)}
            replayRef={frame.slot === 'primary' ? primary : secondary}
            revision={revisions[`${frame.slot}:${proof}`] ?? 0}
            onReset={() => {
              update(frame.slot, proof, initialSession()[proof])
              setRevisions(previous => ({
                ...previous,
                [`${frame.slot}:${proof}`]: (previous[`${frame.slot}:${proof}`] ?? 0) + 1
              }))
            }}
          />
        ))}
      </div>
      <p className="motion-fine-print">
        Reset example restores only that example’s values. Reset motion restores theme settings and
        retains examples. Graphs show the last two seconds; pausing inspection leaves interaction
        live. Springs require the Radiant runtime; legacy CSS timing tokens still govern CSS
        transitions.
      </p>
    </section>
  )
}
