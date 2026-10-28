'use client'

/* oxlint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- Delegated picking handles clicks and Enter/Space on the preview's own focusable elements. */

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  displayValue,
  inheritedColorToken,
  inspectStyling,
  matchedTokens,
  textRole,
  type ControlTarget,
  type ElementStyling,
  type SourceContext,
  type StyleRule,
  type StyleSource
} from './workshop-inspect'

/** What the preview picked: the element whose rules reference theme tokens, and what it read off it. */
export interface Selection {
  element: Element
  name: string
  styling: ElementStyling
}

function* styleRules(rules: CSSRuleList): Generator<StyleRule> {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule)
      yield {
        selector: rule.selectorText,
        cssText: rule.style.cssText,
        color: rule.style.getPropertyValue('color') || undefined
      }
    if ('cssRules' in rule && rule.cssRules instanceof CSSRuleList) yield* styleRules(rule.cssRules)
  }
}
function* documentRules(document: Document): Generator<StyleRule> {
  for (const sheet of document.styleSheets) {
    try {
      yield* styleRules(sheet.cssRules)
    } catch {
      // Cross-origin sheets cannot be read and never style Radiant components.
    }
  }
}
const safeMatches = (element: Element) => (selector: string) => {
  try {
    return element.matches(selector)
  } catch {
    return false
  }
}
const blocks = 'p,ul,ol,blockquote,pre,h1,h2,h3,h4,h5,h6'
const elementName = (element: Element, slot: string | undefined) => {
  const text = element.textContent?.trim().replace(/\s+/g, ' ') ?? ''
  const kind = slot ?? element.tagName.toLowerCase()
  return text ? `${kind} “${text.length > 40 ? `${text.slice(0, 40)}…` : text}”` : kind
}
/** Climb from the pointer target to the nearest element whose matched rules use theme tokens. */
export function readSelection(start: Element): Selection | null {
  const page = start.closest('.preview-page')
  if (!page) return null
  const rules = [...documentRules(start.ownerDocument)]
  let element = start
  let tokens = matchedTokens(rules, safeMatches(element))
  while (!tokens.length && element.parentElement && element.parentElement !== page) {
    element = element.parentElement
    tokens = matchedTokens(rules, safeMatches(element))
  }
  function* ancestors(from: Element) {
    for (let node: Element | null = from; node; node = node === page ? null : node.parentElement)
      yield safeMatches(node)
  }
  const color = inheritedColorToken(rules, ancestors(element))
  if (color && !tokens.includes(color)) tokens = [...tokens, color]
  const within = <T extends Element>(candidate: T | null) =>
    candidate && element.contains(candidate) ? candidate : null
  const explicit = within(start.closest<HTMLElement>('[data-rad-text]'))
  const block = within(start.closest(blocks))
  const slot = element.closest<HTMLElement>('[data-slot]')?.dataset.slot?.split(' ')[0]
  return {
    element,
    name: elementName(element, slot),
    styling: {
      tokens,
      slot,
      textRole: textRole(
        explicit?.dataset.radText,
        block?.tagName,
        block?.parentElement?.hasAttribute('data-rad-prose') ?? false
      )
    }
  }
}

const automaticSelection: Record<string, string> = {
  'prose-body':
    '[data-rad-prose] > :is(p,ul,ol):not([data-rad-text],[data-slot],[data-rad-not-prose])',
  'prose-quote':
    '[data-rad-prose] > blockquote:not([data-rad-text],[data-slot],[data-rad-not-prose])'
}
function outlineStyle(element: Element, host: Element): CSSProperties {
  const rect = element.getBoundingClientRect()
  const origin = host.getBoundingClientRect()
  return {
    top: rect.top - origin.top,
    left: rect.left - origin.left,
    width: rect.width,
    height: rect.height
  }
}

/** While inspecting, pointer and keyboard activation pick an element instead of acting on it. */
export function Inspection({
  enabled,
  role,
  selection,
  onSelect,
  onRole,
  onExit,
  children
}: {
  enabled: boolean
  role: string
  selection: Selection | null
  onSelect: (selection: Selection) => void
  onRole: (role: string) => void
  onExit: () => void
  children: ReactNode
}) {
  const id = useId()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [hovered, setHovered] = useState<Element | null>(null)
  const pointerTarget = useRef<Element | null>(null)
  const [, relayout] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const bump = () => relayout(value => value + 1)
    window.addEventListener('resize', bump)
    const observer = new ResizeObserver(bump)
    if (host) observer.observe(host)
    return () => {
      window.removeEventListener('resize', bump)
      observer.disconnect()
    }
  }, [enabled, host])
  const scope = `[data-inspection=${JSON.stringify(id)}]`
  const safeRole = /^[a-z-]+$/.test(role) ? role : 'prose-body'
  const automatic = automaticSelection[safeRole]
  const pick = (target: EventTarget | null) => {
    if (!enabled || !(target instanceof Element)) return null
    return readSelection(target)
  }
  const select = (event: {
    target: EventTarget | null
    preventDefault(): void
    stopPropagation(): void
  }) => {
    const next = pick(event.target)
    if (!next) return
    event.preventDefault()
    event.stopPropagation()
    onSelect(next)
    if (next.styling.textRole) onRole(next.styling.textRole)
  }
  const shown = selection?.element.isConnected ? selection.element : null
  return (
    <div
      ref={setHost}
      className="preview-inspection"
      data-inspection={id}
      data-inspecting={enabled || undefined}
      onClickCapture={select}
      onKeyDownCapture={event => {
        if (!enabled) return
        if (event.key === 'Escape') {
          event.preventDefault()
          onExit()
        } else if (event.key === 'Enter' || event.key === ' ') select(event)
      }}
      onPointerMoveCapture={event => {
        if (!enabled) return
        const target = event.target instanceof Element ? event.target : null
        if (target === pointerTarget.current) return
        pointerTarget.current = target
        setHovered(target?.closest('.preview-page') ? (pick(target)?.element ?? null) : null)
      }}
      onPointerLeave={() => setHovered(null)}
    >
      {enabled && (
        <style>{`${scope} [data-rad-text="${safeRole}"]${automatic ? `, ${scope} ${automatic}` : ''} { outline: 2px solid var(--rad-color-focus); outline-offset: 3px; }`}</style>
      )}
      {children}
      {enabled && host && hovered && hovered !== shown && (
        <div
          className="inspect-outline"
          data-state="hover"
          style={outlineStyle(hovered, host)}
        />
      )}
      {enabled && host && shown && (
        <div
          className="inspect-outline"
          data-state="selected"
          style={outlineStyle(shown, host)}
        />
      )}
    </div>
  )
}

function Value({ item }: { item: StyleSource }) {
  const text = displayValue(item.kind, item.value)
  return (
    <span
      className="inspect-value"
      data-kind={item.kind}
    >
      {item.kind === 'color' && (
        <span
          className="inspect-swatch"
          style={{ background: item.value }}
        />
      )}
      <span>{text}</span>
    </span>
  )
}
/** The values that style the selection, grouped by editor; each is a jump to its control. */
export function Inspector({
  selection,
  context,
  onJump
}: {
  selection: Selection | null
  context: SourceContext
  onJump: (target: ControlTarget) => void
}) {
  if (!selection || !selection.element.isConnected)
    return (
      <div className="preview-inspector">
        <p className="preview-note">
          Click, or Tab to and press Enter on, anything in the preview to see which theme values
          style it. Escape exits.
        </p>
      </div>
    )
  const { groups, unmapped } = inspectStyling(selection.styling, context)
  const empty = groups.length === 0
  return (
    <section
      className="preview-inspector"
      aria-label="Inspected element"
      data-unmapped={unmapped.join(' ') || undefined}
    >
      <p className="preview-inspector-target">
        Inspecting <strong>{selection.name}</strong>
      </p>
      {empty && <p className="preview-note">Nothing on this element comes from the theme.</p>}
      {groups.map(group => (
        <div
          key={group.editor}
          className="preview-inspector-group"
        >
          <h4>{group.label}</h4>
          {group.hint && <p className="preview-note">{group.hint}</p>}
          <ul>
            {group.items.map(item => (
              <li key={item.field}>
                <button
                  type="button"
                  onClick={() => onJump({ editor: item.editor, field: item.field })}
                >
                  <Value item={item} />
                  <span className="inspect-label">{item.label}</span>
                  {item.note && <small>{item.note}</small>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
