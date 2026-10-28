import type { ThemeMode } from '@cognitap/radiant'
import type { Editor } from './workshop-theme'
import type { MotionTreatment } from './workshop-motion'
import { pageNames, type CopyEdits, type PageScene } from './page-copy'

export type MotionScene = 'actions' | 'drag' | 'follow' | 'layout'
export type InspectionState = 'rest' | 'invalid' | 'disabled' | 'pending'
export type FixedWidth = 800 | 640 | 390 | 320
export type PreviewWidth = { kind: 'fill' } | { kind: 'fixed'; px: FixedWidth }
export type Scene =
  | { kind: 'page'; page: PageScene }
  | { kind: 'components'; state: InspectionState }
  | { kind: 'motion'; scene: MotionScene }
export type ThemeScene = Exclude<Scene, { kind: 'motion' }>
export type Compare =
  | { kind: 'none' }
  | { kind: 'width'; against: PreviewWidth }
  | { kind: 'treatments'; treatments: readonly [MotionTreatment, MotionTreatment] }
export interface PreviewState {
  scene: Scene
  mode: ThemeMode
  width: PreviewWidth
  compare: Compare
  probes: { textSpacing: boolean; inspectText: boolean }
  /** Where each editor family returns to when it becomes relevant again. */
  resume: { theme: ThemeScene; motion: MotionScene }
}

export interface PageSessions {
  article: Record<never, never>
  form: { name: string; email: string; updates: boolean; saved: boolean; attempted: boolean }
  data: { query: string }
  landing: { joined: boolean }
}
export interface MotionSceneSessions {
  actions: { count: number; open: boolean; expanded: boolean }
  drag: { target: number }
  follow: { target: number; running: boolean }
  layout: { order: string[]; wide: boolean; expanded: boolean }
}
export type MotionSlot = 'primary' | 'secondary'
export interface PreviewSession {
  copy: CopyEdits
  pages: PageSessions
  components: { count: number }
  motion: Record<MotionSlot, MotionSceneSessions>
  revisions: Partial<Record<string, number>>
}
export interface Preview {
  view: PreviewState
  session: PreviewSession
}

export const initialPageSessions = (): PageSessions => ({
  article: {},
  form: {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    updates: true,
    saved: false,
    attempted: false
  },
  data: { query: '' },
  landing: { joined: false }
})
export const initialMotionSessions = (): MotionSceneSessions => ({
  actions: { count: 0, open: false, expanded: false },
  drag: { target: 0 },
  follow: { target: 80, running: false },
  layout: { order: ['Files', 'People', 'Archive'], wide: true, expanded: false }
})
export function initialPreview(): Preview {
  const scene: Scene = { kind: 'page', page: 'article' }
  return {
    view: {
      scene,
      mode: 'light',
      width: { kind: 'fill' },
      compare: { kind: 'none' },
      probes: { textSpacing: false, inspectText: false },
      resume: { theme: scene, motion: 'actions' }
    },
    session: {
      copy: {},
      pages: initialPageSessions(),
      components: { count: 0 },
      motion: { primary: initialMotionSessions(), secondary: initialMotionSessions() },
      revisions: {}
    }
  }
}

export const fixedWidths: readonly FixedWidth[] = [800, 640, 390, 320]
export const widthNames: Record<FixedWidth, string> = {
  800: 'Wide · 800px',
  640: 'Medium · 640px',
  390: 'Narrow · 390px',
  320: 'Small · 320px'
}
export const motionSceneNames: Record<MotionScene, string> = {
  actions: 'Press & disclose',
  drag: 'Drag & snap',
  follow: 'Moving target',
  layout: 'Resize & reorder'
}
export const treatmentNames: Record<MotionTreatment, string> = {
  current: 'Your theme',
  restrained: 'Restrained',
  expressive: 'Expressive',
  off: 'Motion off',
  reduced: 'Reduced motion preview'
}
export const treatmentPairs = {
  character: ['restrained', 'expressive'],
  off: ['current', 'off'],
  reduced: ['current', 'reduced']
} as const satisfies Record<string, readonly [MotionTreatment, MotionTreatment]>

export type SceneKey = `page:${PageScene}` | 'components' | `motion:${MotionScene}`
export function sceneKey(scene: Scene): SceneKey {
  return scene.kind === 'page'
    ? `page:${scene.page}`
    : scene.kind === 'motion'
      ? `motion:${scene.scene}`
      : 'components'
}
export function sceneName(scene: Scene): string {
  return scene.kind === 'page'
    ? pageNames[scene.page]
    : scene.kind === 'motion'
      ? motionSceneNames[scene.scene]
      : 'Components'
}
export const sceneGroups: readonly { label: string; scenes: readonly Scene[] }[] = [
  {
    label: 'Pages',
    scenes: (Object.keys(pageNames) as PageScene[]).map(page => ({ kind: 'page', page }))
  },
  { label: 'Components', scenes: [{ kind: 'components', state: 'rest' }] },
  {
    label: 'Motion',
    scenes: (Object.keys(motionSceneNames) as MotionScene[]).map(scene => ({
      kind: 'motion',
      scene
    }))
  }
]
export function parseScene(key: string): Scene | undefined {
  return sceneGroups.flatMap(group => group.scenes).find(scene => sceneKey(scene) === key)
}

export const widthId = (width: PreviewWidth) => (width.kind === 'fill' ? 'fill' : String(width.px))
export const widthName = (width: PreviewWidth) =>
  width.kind === 'fill' ? 'Available width' : widthNames[width.px]
export function parseWidth(id: string): PreviewWidth | undefined {
  if (id === 'fill') return { kind: 'fill' }
  const px = fixedWidths.find(value => String(value) === id)
  return px && { kind: 'fixed', px }
}
const sameWidth = (a: PreviewWidth, b: PreviewWidth) => widthId(a) === widthId(b)

export const compareId = (compare: Compare) =>
  compare.kind === 'none'
    ? 'none'
    : compare.kind === 'width'
      ? widthId(compare.against)
      : (Object.entries(treatmentPairs).find(
          ([, pair]) => pair[0] === compare.treatments[0] && pair[1] === compare.treatments[1]
        )?.[0] ?? 'none')
export function parseCompare(id: string, scene: Scene): Compare {
  if (scene.kind === 'motion') {
    const pair = Object.hasOwn(treatmentPairs, id)
      ? treatmentPairs[id as keyof typeof treatmentPairs]
      : undefined
    return pair ? { kind: 'treatments', treatments: pair } : { kind: 'none' }
  }
  const against = parseWidth(id)
  return against ? { kind: 'width', against } : { kind: 'none' }
}
/** Compare options for the current scene kind, excluding the width already shown. */
export function compareChoices(view: PreviewState): readonly [string, string][] {
  if (view.scene.kind === 'motion')
    return [
      ['none', 'None'],
      ['character', 'Restrained + Expressive'],
      ['off', 'Your theme + Motion off'],
      ['reduced', 'Your theme + Reduced motion']
    ]
  const widths: PreviewWidth[] = [
    { kind: 'fill' },
    ...fixedWidths.map((px): PreviewWidth => ({ kind: 'fixed', px }))
  ]
  return [
    ['none', 'None'],
    ...widths
      .filter(width => !sameWidth(width, view.width))
      .map((width): [string, string] => [widthId(width), `+ ${widthName(width)}`])
  ]
}
function fits(compare: Compare, scene: Scene): boolean {
  return compare.kind === 'none' || (compare.kind === 'treatments') === (scene.kind === 'motion')
}

export interface Frame {
  id: string
  width: PreviewWidth
  treatment: MotionTreatment
  slot: MotionSlot
  label: string
}
export function frames(view: PreviewState): Frame[] {
  const { width, compare } = view
  if (compare.kind === 'treatments')
    return compare.treatments.map((treatment, index) => ({
      id: `${index}:${treatment}`,
      width,
      treatment,
      slot: index === 0 ? 'primary' : 'secondary',
      label: treatmentNames[treatment]
    }))
  const widths = compare.kind === 'width' ? [width, compare.against] : [width]
  const label = (frameWidth: PreviewWidth) =>
    view.scene.kind === 'motion'
      ? treatmentNames.current
      : frameWidth.kind === 'fill'
        ? widthName(frameWidth)
        : `${frameWidth.px}px CSS width`
  return widths.map(frameWidth => ({
    id: widthId(frameWidth),
    width: frameWidth,
    treatment: 'current',
    slot: 'primary',
    label: label(frameWidth)
  }))
}

type PagePatch = {
  [K in PageScene]: { type: 'page'; page: K; patch: Partial<PageSessions[K]> }
}[PageScene]
export type PreviewAction =
  | { type: 'scene'; scene: Scene }
  | { type: 'component-state'; state: InspectionState }
  | { type: 'mode'; mode: ThemeMode }
  | { type: 'width'; width: PreviewWidth }
  | { type: 'compare'; compare: Compare }
  | { type: 'probe'; probe: keyof PreviewState['probes']; on: boolean }
  | { type: 'editor'; editor: Editor }
  | { type: 'copy'; page: PageScene; key: string; value: string }
  | PagePatch
  | { type: 'components'; patch: Partial<PreviewSession['components']> }
  | { type: 'motion'; slot: MotionSlot; sessions: MotionSceneSessions }
  | { type: 'reset-scene' }

function changeScene(view: PreviewState, next: Scene): PreviewState {
  const scene: Scene =
    next.kind === 'components' && view.scene.kind === 'components' ? view.scene : next
  return {
    ...view,
    scene,
    compare: fits(view.compare, scene) ? view.compare : { kind: 'none' },
    resume: {
      theme: scene.kind === 'motion' ? view.resume.theme : scene,
      motion: scene.kind === 'motion' ? scene.scene : view.resume.motion
    }
  }
}

export function previewReducer(preview: Preview, action: PreviewAction): Preview {
  const { view, session } = preview
  switch (action.type) {
    case 'scene':
      return { ...preview, view: changeScene(view, action.scene) }
    case 'component-state':
      return view.scene.kind === 'components'
        ? { ...preview, view: { ...view, scene: { kind: 'components', state: action.state } } }
        : preview
    case 'mode':
      return { ...preview, view: { ...view, mode: action.mode } }
    case 'width':
      return {
        ...preview,
        view: {
          ...view,
          width: action.width,
          compare:
            view.compare.kind === 'width' && sameWidth(view.compare.against, action.width)
              ? { kind: 'none' }
              : view.compare
        }
      }
    case 'compare':
      return fits(action.compare, view.scene)
        ? { ...preview, view: { ...view, compare: action.compare } }
        : preview
    case 'probe':
      return {
        ...preview,
        view: { ...view, probes: { ...view.probes, [action.probe]: action.on } }
      }
    case 'editor': {
      const relevant =
        action.editor === 'motion'
          ? view.scene.kind === 'motion'
            ? view.scene
            : { kind: 'motion' as const, scene: view.resume.motion }
          : view.scene.kind === 'motion'
            ? view.resume.theme
            : view.scene
      const next = relevant === view.scene ? view : changeScene(view, relevant)
      return {
        ...preview,
        view: {
          ...next,
          probes: {
            ...next.probes,
            inspectText: action.editor === 'typography' && next.probes.inspectText
          }
        }
      }
    }
    case 'copy':
      return {
        ...preview,
        session: {
          ...session,
          copy: {
            ...session.copy,
            [action.page]: { ...session.copy[action.page], [action.key]: action.value }
          }
        }
      }
    case 'page':
      return {
        ...preview,
        session: {
          ...session,
          pages: {
            ...session.pages,
            [action.page]: { ...session.pages[action.page], ...action.patch }
          }
        }
      }
    case 'components':
      return {
        ...preview,
        session: { ...session, components: { ...session.components, ...action.patch } }
      }
    case 'motion':
      return {
        ...preview,
        session: {
          ...session,
          motion: { ...session.motion, [action.slot]: action.sessions }
        }
      }
    case 'reset-scene': {
      const key = sceneKey(view.scene)
      const revisions = { ...session.revisions, [key]: (session.revisions[key] ?? 0) + 1 }
      if (view.scene.kind === 'page') {
        const copy = { ...session.copy }
        delete copy[view.scene.page]
        return {
          ...preview,
          session: {
            ...session,
            copy,
            pages: { ...session.pages, [view.scene.page]: initialPageSessions()[view.scene.page] },
            revisions
          }
        }
      }
      if (view.scene.kind === 'components')
        return { ...preview, session: { ...session, components: { count: 0 }, revisions } }
      const scene = view.scene.scene
      const reset = (slot: MotionSceneSessions): MotionSceneSessions => ({
        ...slot,
        [scene]: initialMotionSessions()[scene]
      })
      return {
        ...preview,
        session: {
          ...session,
          motion: {
            primary: reset(session.motion.primary),
            secondary: reset(session.motion.secondary)
          },
          revisions
        }
      }
    }
  }
}
