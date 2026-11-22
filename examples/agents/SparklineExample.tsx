'use client'
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- The inline SVG drawing is named as one image. */
import { Stack, themeTokenVar } from '@cognitap/radiant'
import { extendCatalog, radiantCatalog } from '@cognitap/radiant/catalog'
import {
  A2UI_PROTOCOL_VERSION,
  A2uiSurface,
  createA2uiExtensionEntry,
  createA2uiExtensionRegistry,
  readA2uiValue,
  validateA2uiAccessibility,
  type A2uiAccessibilityRule,
  type A2uiMessage
} from '@cognitap/radiant/a2ui'

/** Your own component. It styles itself with public tokens, so it follows every theme. */
function Sparkline({ label, values }: { label: string; values: readonly number[] }) {
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const points = values
    .map(
      (value, index) =>
        `${(index * 116) / (values.length - 1) + 2},${30 - ((value - min) / range) * 28}`
    )
    .join(' ')
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 120 32"
      width={120}
      height={32}
    >
      <polyline
        points={points}
        style={{ fill: 'none', stroke: themeTokenVar('--rad-color-accent'), strokeWidth: 2 }}
      />
    </svg>
  )
}

/** The canonical entry: what the agent may set, and when to use it. */
const catalog = extendCatalog(radiantCatalog, {
  id: 'example/sparkline',
  version: '1.0.0',
  description: 'Radiant plus a trend line.',
  entries: {
    Sparkline: {
      name: 'Sparkline',
      category: 'data',
      description: 'Compact trend line for a short series.',
      guidance: {
        whenToUse: 'A trend beside a metric.',
        whenNotToUse: 'Exact values or comparisons.',
        examples: ['weekly signups', 'error rate']
      },
      propsSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['label', 'values'],
        properties: {
          label: { type: 'string', minLength: 1, description: 'Accessible name of the trend.' },
          values: { type: 'array', minItems: 2, items: { type: 'number' } }
        }
      },
      slots: {},
      bindings: {},
      actions: {}
    }
  }
})

/** The accessibility check reports a Sparkline without a name. */
const sparklineLabel: A2uiAccessibilityRule = {
  id: 'sparkline-label',
  check(component) {
    if (typeof component.label === 'string' && component.label.trim()) return
    return { prop: 'label', message: `Sparkline "${String(component.id)}" has no label.` }
  }
}

const sparkline = createA2uiExtensionEntry(catalog, {
  name: 'Sparkline',
  component: Sparkline,
  accessibility: [sparklineLabel],
  adapter(props) {
    const label = readA2uiValue(props.label)
    const values = readA2uiValue(props.values)
    return (
      <Sparkline
        label={typeof label === 'string' ? label : ''}
        values={Array.isArray(values) ? values.filter(value => typeof value === 'number') : []}
      />
    )
  }
})

/** Send `registry.toCatalogJson()` to the agent, and render and check with the same registry. */
export const registry = createA2uiExtensionRegistry(catalog, {
  catalogId: 'https://example.com/a2ui/catalog.json',
  entries: [sparkline]
})

const trendMessages: readonly A2uiMessage[] = [
  {
    version: A2UI_PROTOCOL_VERSION,
    createSurface: {
      surfaceId: 'trends',
      catalogId: 'https://example.com/a2ui/catalog.json',
      components: [
        { id: 'root', component: 'Column', children: ['heading', 'signups'] },
        { id: 'heading', component: 'Text', text: 'Signups this week' },
        { id: 'signups', component: 'Sparkline', label: 'Signups', values: [3, 5, 4, 8, 7, 11, 12] }
      ]
    }
  }
]

export function SparklineExample() {
  // Run this on your server before storing the surface.
  const { errors } = validateA2uiAccessibility(trendMessages, { registry })
  return (
    <Stack>
      <A2uiSurface
        surfaceId="trends"
        messages={trendMessages}
        registry={registry}
      />
      <output>
        {errors.length === 0
          ? 'Accessibility check passed.'
          : errors.map(error => error.message).join(' ')}
      </output>
    </Stack>
  )
}
