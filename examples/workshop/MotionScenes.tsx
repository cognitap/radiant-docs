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
  type ThemeMode
} from '@cognitap/radiant'
import { bindSpringStyle } from '@cognitap/radiant/motion'
import {
  useReducedMotion,
  useSpring,
  useSpringDrag,
  useSpringFollow,
  useSpringLayout
} from '@cognitap/radiant/motion/react'
import { MotionInspector, type MotionReader } from './MotionInspector'
import { Chips } from './TypographyPickers'
import { publishMovement } from './motion-trace'
import { PreviewFrame } from './PreviewFrame'
import { motionPreview } from './workshop-motion'
import type { Frame, MotionScene, MotionSceneSessions } from './workshop-preview'
import type { ToolProps } from './preview-tools'
import './motion-editor.css'

export type Replay = RefObject<(() => void) | null>

/** What the inspector graphs in a scene with more than one moving part. */
const measures = {
  actions: [
    { value: 'press', label: 'Button scale' },
    { value: 'disclosure', label: 'Disclosure height' }
  ],
  layout: [
    { value: 'width', label: 'Card width' },
    { value: 'height', label: 'Card height' },
    { value: 'y', label: 'Card position' }
  ]
} as const
type Measures = { [K in keyof typeof measures]: (typeof measures)[K][number]['value'] }
const initialMeasures: Measures = { actions: 'press', layout: 'width' }
export type MotionUpdate = (sessions: MotionSceneSessions) => void

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

function ActionScene({
  model,
  metric,
  onChange,
  sourceRef,
  replayRef
}: {
  model: MotionSceneSessions['actions']
  metric: Measures['actions']
  onChange: (next: MotionSceneSessions['actions']) => void
  sourceRef: RefObject<MotionReader | null>
  replayRef: Replay
}) {
  const button = useRef<HTMLButtonElement>(null)
  const details = useRef<HTMLDetailsElement>(null)
  const content = useRef<HTMLDivElement>(null)
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
    <div className="motion-scene motion-actions-scene">
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
    </div>
  )
}

function DragScene({
  model,
  onChange,
  sourceRef,
  replayRef
}: {
  model: MotionSceneSessions['drag']
  onChange: (next: MotionSceneSessions['drag']) => void
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
        Drag sideways, or use the arrow keys.
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

function FollowScene({
  model,
  onChange,
  sourceRef,
  replayRef
}: {
  model: MotionSceneSessions['follow']
  onChange: (next: MotionSceneSessions['follow']) => void
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
      <p className="motion-fine-print">
        The filled dot follows the outlined one. Move across the track.
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

function LayoutScene({
  model,
  metric,
  onChange,
  sourceRef,
  replayRef
}: {
  model: MotionSceneSessions['layout']
  metric: Measures['layout']
  onChange: (next: MotionSceneSessions['layout']) => void
  sourceRef: RefObject<MotionReader | null>
  replayRef: Replay
}) {
  const root = useRef<HTMLDivElement>(null),
    first = useRef<HTMLDivElement>(null)
  const layout = useSpringLayout(root)
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
    </div>
  )
}

/** One motion frame owns its treatment theme and the inspector that samples it. */
export function MotionFrame({
  document,
  mode,
  frame,
  captioned,
  scene,
  session,
  revision,
  replayRef,
  onUpdate
}: {
  document: object
  mode: ThemeMode
  frame: Frame
  captioned: boolean
  scene: MotionScene
  session: MotionSceneSessions
  revision: number
  replayRef: Replay
  onUpdate: MotionUpdate
}) {
  const theme = useMemo(() => motionPreview(document, frame.treatment), [document, frame.treatment])
  const reduced = useReducedMotion()
  const sourceRef = useRef<MotionReader | null>(null)
  const key = `${scene}:${revision}`
  const [measured, setMeasured] = useState(initialMeasures)
  const status = reduced ? 'Reduced motion: on' : theme.motion.mode === 'off' ? 'Motion off' : null
  return (
    <PreviewFrame
      theme={theme}
      mode={mode}
      width={frame.width}
      label={frame.label}
      captioned={captioned}
      footer={
        <MotionInspector
          key={key}
          sourceRef={sourceRef}
          onMovement={frame.slot === 'primary' ? publishMovement : undefined}
        >
          {(scene === 'actions' || scene === 'layout') && (
            <Chips
              label="Measure"
              options={measures[scene]}
              value={measured[scene]}
              onChange={value => {
                const next = measures[scene].find(option => option.value === value)
                if (next) setMeasured({ ...measured, [scene]: next.value })
              }}
            />
          )}
        </MotionInspector>
      }
    >
      {status && <p className="motion-status">{status}</p>}
      <div key={key}>
        {scene === 'actions' ? (
          <ActionScene
            model={session.actions}
            metric={measured.actions}
            onChange={value => onUpdate({ ...session, actions: value })}
            sourceRef={sourceRef}
            replayRef={replayRef}
          />
        ) : scene === 'drag' ? (
          <DragScene
            model={session.drag}
            onChange={value => onUpdate({ ...session, drag: value })}
            sourceRef={sourceRef}
            replayRef={replayRef}
          />
        ) : scene === 'follow' ? (
          <FollowScene
            model={session.follow}
            onChange={value => onUpdate({ ...session, follow: value })}
            sourceRef={sourceRef}
            replayRef={replayRef}
          />
        ) : (
          <LayoutScene
            model={session.layout}
            metric={measured.layout}
            onChange={value => onUpdate({ ...session, layout: value })}
            sourceRef={sourceRef}
            replayRef={replayRef}
          />
        )}
      </div>
    </PreviewFrame>
  )
}

export function MotionTools({ view, disabled, replay }: ToolProps) {
  return (
    <div className="preview-tools">
      <Button
        variant="outline"
        controlSize="small"
        disabled={disabled}
        onClick={replay}
      >
        {view.compare.kind === 'treatments' ? 'Replay both' : 'Replay'}
      </Button>
    </div>
  )
}
