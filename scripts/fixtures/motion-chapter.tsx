import { StrictMode, useEffect, useRef } from 'react'
import {
  Button,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  ThemeScope,
  defineTheme,
  defaultMotionProfile
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import {
  createSpring,
  createSpringDrag,
  bindSpringSource,
  bindSpringDrag,
  bindSpringLayout
} from '@cognitap/radiant/motion'

const parameters = { stiffness: 180, damping: 14, mass: 1 }
const theme = defineTheme({
  id: 'chapter-proof',
  name: 'Chapter proof',
  motion: { spring: parameters }
})
const frame = () => new Promise<number>(resolve => requestAnimationFrame(resolve))
async function until(check: () => boolean) {
  for (let i = 0; i < 240; i++) {
    if (check()) return
    await frame()
  }
  throw new Error('Instrumented motion did not reach its required state')
}
async function samples(read: () => number, count = 4) {
  const result = []
  for (let i = 0; i < count; i++) {
    const time = await frame()
    result.push({ time, position: read() })
  }
  return result
}
function pointer(node: HTMLElement, type: string) {
  node.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      button: 0,
      pointerId: 1,
      isPrimary: true,
      pointerType: 'mouse'
    })
  )
}

function Proof() {
  const commits = useRef(0)
  useEffect(() => {
    commits.current++
  })
  const button = useRef<HTMLButtonElement>(null),
    details = useRef<HTMLDetailsElement>(null)
  const track = useRef<HTMLDivElement>(null),
    handle = useRef<HTMLButtonElement>(null)
  const group = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const source = createSpring(0, { enabled: false })
    const follower = createSpring(0, { parameters })
    const unsubscribe = bindSpringSource(follower, source)
    const drag = createSpringDrag(0, { min: 0, max: 240, snapPoints: [0, 120, 240], parameters })
    const unbindDrag = bindSpringDrag(handle.current!, drag)
    const layout = bindSpringLayout(group.current!, { parameters })
    const api = {
      active: true,
      parameters,
      async run() {
        const traces: Record<string, unknown> = {}
        const scale = () => Number(getComputedStyle(button.current!).scale) || 1
        pointer(button.current!, 'pointerdown')
        await until(() => scale() < 0.86)
        pointer(button.current!, 'pointerup')
        await until(() => scale() > 0.87 && scale() < 0.95)
        const before = scale()
        const beforePress = await samples(scale, 2)
        const retained = scale()
        pointer(button.current!, 'pointerdown')
        const immediate = scale(),
          after = await samples(scale)
        traces.press = {
          unit: 'scale',
          before,
          beforePress,
          retarget: { before: retained, after: immediate },
          after,
          velocity: 'derived from rendered frame samples'
        }
        pointer(button.current!, 'pointerup')
        await until(() => Math.abs(scale() - 1) < 0.001)
        const summary = details.current!.querySelector('summary')!
        const height = () =>
          parseFloat(getComputedStyle(details.current!, '::details-content').height) || 0
        summary.click()
        await until(() => height() > 35 && height() < 90)
        const beforeClose = await samples(height, 2)
        const heightBefore = height()
        details.current!.open = false
        const heightAfter = height(),
          closed = await samples(height)
        traces.disclosure = {
          unit: 'px',
          beforeClose,
          retarget: { before: heightBefore, after: heightAfter },
          after: closed,
          velocity: 'derived from rendered frame samples',
          closed: !details.current!.open,
          inert: details.current!.querySelector<HTMLElement>('[data-slot~="collapsible-content"]')!
            .inert
        }
        await until(() => height() < 0.1)
        drag.begin()
        drag.move(30, 0)
        drag.move(70, 20)
        const release = drag.release(20)
        await until(() => drag.get() > 80 && drag.get() < 180)
        const dragBefore = { position: drag.get(), velocity: drag.getVelocity() }
        drag.to(0)
        const dragAfter = { position: drag.get(), velocity: drag.getVelocity() }
        traces.drag = {
          unit: 'px',
          release,
          before: dragBefore,
          immediate: dragAfter,
          after: await samples(() => drag.get())
        }
        await until(() => !drag.isAnimating())
        source.to(180)
        await until(() => follower.get() > 35 && follower.get() < 120)
        const following = []
        for (let i = 0; i < 12; i++) {
          const before = { position: follower.get(), velocity: follower.getVelocity() }
          source.to(-100 + i * 4)
          following.push({
            before,
            immediate: { position: follower.get(), velocity: follower.getVelocity() },
            time: await frame(),
            position: follower.get()
          })
        }
        traces.follow = { unit: 'px', retargets: following }
        const first = group.current!.firstElementChild as HTMLElement
        const input = first.querySelector('input')!
        group.current!.append(first)
        layout.measure()
        await until(() => layout.get(first)!.y > 25)
        const layoutRetargets = []
        for (let i = 0; i < 6; i++) {
          const before = { position: layout.get(first)!, velocity: layout.getVelocity(first)! }
          if (i % 2) group.current!.append(first)
          else group.current!.prepend(first)
          layout.measure()
          layoutRetargets.push({
            before,
            immediate: { position: layout.get(first)!, velocity: layout.getVelocity(first)! },
            time: await frame(),
            position: layout.get(first)!
          })
        }
        input.focus()
        input.setSelectionRange(1, 3)
        group.current!.style.gridTemplateColumns = 'repeat(2, 120px)'
        layout.measure()
        await until(() => layout.get(first)!.width < 137)
        const resizeBefore = { position: layout.get(first)!, velocity: layout.getVelocity(first)! }
        group.current!.style.gridTemplateColumns = 'repeat(2, 140px)'
        layout.measure()
        layoutRetargets.push({
          before: resizeBefore,
          immediate: { position: layout.get(first)!, velocity: layout.getVelocity(first)! },
          time: await frame(),
          position: layout.get(first)!
        })
        traces.layout = {
          unit: 'px',
          retargets: layoutRetargets,
          focusRetainedOnResize: document.activeElement === input,
          selection: [input.selectionStart, input.selectionEnd],
          scale: getComputedStyle(first.firstElementChild!).scale,
          transform: getComputedStyle(first.firstElementChild!).transform
        }
        await until(() => !layout.isAnimating())
        const performanceResults = []
        for (const count of [1, 16]) {
          const beforeCommits = commits.current
          const work = Array.from({ length: count }, () => createSpring(0))
          const frames = []
          let last = performance.now()
          for (let i = 0; i < 30; i++) {
            const now = await frame(),
              start = performance.now()
            for (const spring of work) spring.to(i % 2 ? 100 : 0)
            if (count > 1) {
              if (i % 2) group.current!.append(first)
              else group.current!.prepend(first)
              layout.measure()
            }
            frames.push({ interval: now - last, work: performance.now() - start })
            last = now
          }
          work.forEach(spring => spring.destroy())
          performanceResults.push({
            springParameters: defaultMotionProfile.spring,
            springs: count,
            layout: count > 1,
            frames,
            reactCommits: commits.current - beforeCommits
          })
        }
        traces.performance = performanceResults
        await until(() => !layout.isAnimating())
        return traces
      },
      startPending() {
        source.to(500)
        drag.to(240)
      },
      read() {
        return {
          source: source.get(),
          follower: follower.get(),
          drag: drag.get(),
          active: api.active
        }
      }
    }
    Object.assign(window, { motionChapter: api })
    return () => {
      api.active = false
      unsubscribe()
      unbindDrag()
      layout.destroy()
      drag.destroy()
      follower.destroy()
      source.destroy()
    }
  }, [])
  return (
    <ThemeScope theme={theme}>
      <MotionProvider>
        <form onSubmit={event => event.preventDefault()}>
          <Button
            ref={button}
            type="submit"
            name="intent"
            value="save"
            style={{ '--rad-button-press-scale': '.8', transform: 'rotate(7deg)' }}
          >
            Native spring
          </Button>
          <Button disabled>Disabled</Button>
          <Button pending>Pending</Button>
        </form>
        <Collapsible ref={details}>
          <CollapsibleTrigger>Disclosure</CollapsibleTrigger>
          <CollapsibleContent style={{ padding: 0 }}>
            <div style={{ height: 120 }}>
              <input aria-label="Disclosure input" />
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div
          ref={track}
          style={{ width: 300, height: 60 }}
        >
          <Button
            ref={handle}
            className="transition-colors"
          >
            Drag
          </Button>
        </div>
        <div
          ref={group}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 140px)', gap: 16, width: 296 }}
        >
          {['Alpha', 'Beta', 'Gamma'].map(name => (
            <div
              key={name}
              data-rad-layout-slot=""
              style={{ display: 'flow-root' }}
            >
              <div
                data-rad-layout-part=""
                style={{ display: 'flow-root', border: '2px solid', padding: 12 }}
              >
                <label>
                  {name}
                  <input defaultValue={name} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </MotionProvider>
    </ThemeScope>
  )
}
export function App() {
  return (
    <StrictMode>
      <Proof />
    </StrictMode>
  )
}
