import { Demo } from './demo/Demo'
import {
  CompositionPlayground,
  type CompositionKind
} from '@/examples/compositions/CompositionPlayground'

const examples = {
  dialog: ['Interactive Dialog', 'DialogExample.tsx'],
  collapsible: ['Native disclosure', 'CollapsibleExample.tsx'],
  accordion: ['Interactive Accordion', 'AccordionExample.tsx'],
  card: ['Card with actions', 'CardExample.tsx']
} satisfies Record<CompositionKind, readonly [string, string]>

export function CompositionDemo({
  kind,
  controlled = false
}: {
  kind: CompositionKind
  controlled?: boolean
}) {
  const [title, file] = examples[kind]
  return (
    <Demo
      title={controlled ? 'Controlled disclosure' : title}
      files={[
        `compositions/${file}`,
        'compositions/composition-types.ts',
        'compositions/composition-example.css',
        ...(kind === 'dialog' || kind === 'card' ? ['profile/useHydrated.ts'] : [])
      ]}
    >
      <CompositionPlayground
        kind={kind}
        defaultControlled={controlled}
      />
      <noscript className="demo-feedback">
        Basic native details and links work without JavaScript. Enable it for coordinated selection,
        disabled guards, dialogs, state controls and local action feedback.
      </noscript>
    </Demo>
  )
}
