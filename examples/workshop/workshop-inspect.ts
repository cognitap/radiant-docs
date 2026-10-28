import {
  defineMotionProfile,
  type MotionInteraction,
  type MotionProfileInput
} from '@cognitap/radiant'
import { editors, type Editor } from './workshop-theme.ts'
import { roleNames, type ColorRecipe, type Mode, type Role } from './workshop-color.ts'
import { geometryDials } from './workshop-geometry.ts'
import { motionDials, motionScopes } from './workshop-motion.ts'
import { styleName } from './workshop-typography.ts'

export type TokenName = `--rad-${string}`
export type ValueKind = 'color' | 'length' | 'family' | 'duration' | 'shadow' | 'physics' | 'text'
/** The control that edits one theme decision: an editor and a field path from that editor's Fields. */
export interface ControlTarget {
  editor: Editor
  field: string
}
export interface StyleSource extends ControlTarget {
  label: string
  kind: ValueKind
  value: string
  /** Set when the control drives this value indirectly rather than editing it. */
  note?: string
}
export interface SourceContext {
  values: Readonly<Record<string, string | number | undefined>>
  mode: Mode
  color: ColorRecipe | null
  motion: MotionProfileInput
}
/** What the DOM adapter reads off an element; everything after that is pure. */
export interface ElementStyling {
  tokens: readonly TokenName[]
  slot: string | undefined
  textRole: string | undefined
}
export interface Inspection {
  groups: { editor: Editor; label: string; hint?: string; items: StyleSource[] }[]
  /** Themed tokens with no workshop control; component hooks left at `initial` are not listed. */
  unmapped: TokenName[]
}

interface SourceSpec {
  editor: Editor
  label: string
  kind: ValueKind
  field: (context: SourceContext) => string
  note?: (context: SourceContext) => string | undefined
}
const fixed = (editor: Editor, field: string, label: string, kind: ValueKind): SourceSpec => ({
  editor,
  label,
  kind,
  field: () => field
})
const kebab = (name: string) => name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
const dialLabel = (key: string) => geometryDials.find(dial => dial.key === key)!.label

const specs = new Map<TokenName, SourceSpec>()
const define = (tokens: readonly TokenName[], spec: SourceSpec) => {
  for (const token of tokens) specs.set(token, spec)
}

for (const role of Object.keys(roleNames) as Role[])
  define([role === 'canvas' ? '--rad-surface-canvas' : `--rad-color-${kebab(role)}`], {
    editor: 'color',
    label: roleNames[role],
    kind: 'color',
    field: ({ mode }) => `role.${mode}.${role}`,
    note: ({ color, mode }) => (color?.modes?.[mode]?.[role] === undefined ? 'Automatic' : 'Pinned')
  })

define([
  '--rad-spacing-label-gap',
  '--rad-spacing-field-gap',
  '--rad-spacing-group-gap',
  '--rad-spacing-header-gap',
  '--rad-spacing-footer-gap',
  '--rad-surface-padding',
  '--rad-surface-gap'
], fixed('geometry', 'shared.spacing', dialLabel('spacing'), 'length'))
define(
  (['small', 'medium', 'large'] as const).flatMap((size): TokenName[] => [
    `--rad-control-${size}-height`,
    `--rad-control-${size}-padding-inline`,
    `--rad-control-${size}-indicator-size`
  ]),
  fixed('geometry', 'shared.density', dialLabel('density'), 'length')
)
define(['--rad-control-radius'], fixed(
  'geometry',
  'shared.controlRadius',
  dialLabel('controlRadius'),
  'length'
))
define(['--rad-surface-radius'], fixed(
  'geometry',
  'shared.surfaceRadius',
  dialLabel('surfaceRadius'),
  'length'
))
define(['--rad-control-border-width'], fixed(
  'geometry',
  'shared.controlBorderWidth',
  dialLabel('controlBorderWidth'),
  'length'
))
define(['--rad-surface-border-width'], fixed(
  'geometry',
  'shared.surfaceBorderWidth',
  dialLabel('surfaceBorderWidth'),
  'length'
))
define(['--rad-control-border-style', '--rad-surface-border-style'], fixed(
  'geometry',
  'shared.borderStyle',
  'Border style',
  'text'
))
define(['--rad-surface-shadow', '--rad-surface-overlay-shadow'], fixed(
  'geometry',
  'shared.elevation',
  'Surface elevation',
  'shadow'
))
define(['--rad-surface-backdrop'], fixed(
  'geometry',
  'shared.backdropOpacity',
  dialLabel('backdropOpacity'),
  'color'
))

export const typographyRoles = [
  'prose-title',
  'prose-heading',
  'prose-subheading',
  'prose-body',
  'prose-lead',
  'prose-small',
  'prose-quote',
  'ui-title',
  'ui-body',
  'ui-label',
  'ui-supporting',
  'ui-caption',
  'ui-metric',
  'ui-eyebrow',
  'display',
  'code'
] as const
const styleProperties = [
  'family',
  'size',
  'fluid-size',
  'weight',
  'line-height',
  'letter-spacing',
  'measure'
]
for (const role of typographyRoles)
  define(
    styleProperties.map((property): TokenName => `--rad-typography-roles-${role}-${property}`),
    fixed('typography', `style.${role}.assignment`, styleName(role), 'family')
  )
define(['--rad-typography-family'], fixed('typography', 'font.body', 'Body assignment', 'family'))
define([
  '--rad-typography-flow-paragraph',
  '--rad-typography-flow-heading-before',
  '--rad-typography-flow-heading-after'
], fixed('typography', 'prose.paragraphSpacing', 'Prose paragraph spacing', 'length'))
define(['--rad-typography-body-size'], fixed('typography', 'ui.size', 'UI size', 'length'))

define([
  '--rad-motion-press-duration',
  '--rad-motion-press-ease',
  '--rad-motion-release-duration',
  '--rad-motion-release-ease',
  '--rad-motion-color-duration',
  '--rad-motion-disclosure-duration'
], fixed('motion', 'mode', 'Theme motion', 'duration'))

/** Radiant slots whose interaction runs on a spring from the motion profile. */
export const slotInteractions: Readonly<Record<string, MotionInteraction>> = {
  button: 'press',
  'collapsible-trigger': 'disclosure',
  'accordion-trigger': 'disclosure',
  dialog: 'dialog'
}

const blockRoles: Readonly<Record<string, string>> = {
  P: 'prose-body',
  UL: 'prose-body',
  OL: 'prose-body',
  BLOCKQUOTE: 'prose-quote',
  PRE: 'code',
  H1: 'prose-title',
  H2: 'prose-heading',
  H3: 'prose-subheading',
  H4: 'prose-subheading',
  H5: 'prose-subheading',
  H6: 'prose-subheading'
}
/** Explicit data-rad-text wins; otherwise a block directly inside prose takes its semantic role. */
export function textRole(
  explicit: string | undefined,
  blockTag: string | undefined,
  inProse: boolean
) {
  return explicit ?? (inProse && blockTag ? blockRoles[blockTag] : undefined)
}

const reference = /var\(\s*(--rad-[\w-]+)/g
export function tokensIn(cssText: string): TokenName[] {
  return [...new Set([...cssText.matchAll(reference)].map(match => match[1] as TokenName))]
}
const transientState = /(?<!\\):(?:hover|focus-visible|focus-within|focus|active)(?![\w-])/g
const pseudoElement = /(?<!\\)::[\w-]+(?:\([^)]*\))?/g
/** The states a selector styles belong to the element too; pseudo-elements never match. */
export function normalizeSelector(selector: string): string {
  return selector.replace(transientState, '').replace(pseudoElement, '')
}
export interface StyleRule {
  selector: string
  cssText: string
}
export function matchedTokens(
  rules: Iterable<StyleRule>,
  matches: (selector: string) => boolean
): TokenName[] {
  const tokens = new Set<TokenName>()
  for (const rule of rules) {
    const selector = normalizeSelector(rule.selector)
    if (!selector.trim() || !matches(selector)) continue
    for (const token of tokensIn(rule.cssText)) tokens.add(token)
  }
  return [...tokens]
}

const hints = { color: 'Automatic roles follow Brand color; the role control pins an exact value.' }
function springSource(slot: string, { motion }: SourceContext): StyleSource | undefined {
  const interaction = slotInteractions[slot]
  if (!interaction) return undefined
  const override = motion.interactions?.[interaction]
  const overridden = !!override && Object.keys(override).length > 0
  const spring = defineMotionProfile(motion).interactions[interaction]
  return {
    editor: 'motion',
    field: `${overridden ? interaction : 'shared'}.${motionDials[0]!.key}`,
    label: `${motionScopes.find(scope => scope.id === interaction)!.label} physics`,
    kind: 'physics',
    value: motionDials.map(dial => `${dial.label.toLowerCase()} ${spring[dial.key]}`).join(' · '),
    note: overridden ? undefined : 'Inherits common physics'
  }
}
/** Every theme decision behind an element, one item per control, in editor order. */
export function inspectStyling(styling: ElementStyling, context: SourceContext): Inspection {
  const items = new Map<string, StyleSource>()
  const unmapped: TokenName[] = []
  const add = (source: StyleSource) => {
    const key = `${source.editor}:${source.field}`
    if (!items.has(key)) items.set(key, source)
  }
  for (const token of styling.tokens) {
    const spec = specs.get(token)
    const value = context.values[token]
    if (!spec) {
      if (value !== undefined && value !== 'initial') unmapped.push(token)
      continue
    }
    add({
      editor: spec.editor,
      field: spec.field(context),
      label: spec.label,
      kind: spec.kind,
      value: String(context.values[token] ?? ''),
      note: spec.note?.(context)
    })
  }
  if (styling.textRole && typographyRoles.includes(styling.textRole as never))
    add({
      editor: 'typography',
      field: `style.${styling.textRole}.assignment`,
      label: styleName(styling.textRole),
      kind: 'family',
      value: String(context.values[`--rad-typography-roles-${styling.textRole}-family`] ?? '')
    })
  if (styling.slot) {
    const spring = springSource(styling.slot, context)
    if (spring) add(spring)
  }
  const groups = editors
    .map(({ id, label }) => {
      const own = [...items.values()].filter(item => item.editor === id)
      return {
        editor: id,
        label,
        hint: own.some(item => item.note === 'Automatic') ? hints.color : undefined,
        items: own
      }
    })
    .filter(group => group.items.length > 0)
  return { groups, unmapped }
}

const remToPx = (value: string) =>
  value.replace(
    /(-?\d*\.?\d+)rem\b/g,
    (_, rem: string) => `${Math.round(Number(rem) * 16 * 100) / 100}px`
  )
/** How the inspector prints a value of each kind. */
export function displayValue(kind: ValueKind, value: string): string {
  if (kind === 'length') return remToPx(value)
  if (kind === 'family')
    return value
      .split(',')[0]!
      .trim()
      .replaceAll(/^["']|["']$/g, '')
  return value
}
