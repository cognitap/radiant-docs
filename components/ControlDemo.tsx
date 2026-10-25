import { Demo } from './demo/Demo'
import { ControlPlayground, type ControlKind } from '@/examples/controls/ControlPlayground'

const examples = {
  field: ['Field relationships', 'FieldExample.tsx'],
  input: ['Email input', 'InputExample.tsx'],
  checkbox: ['Checkbox value', 'CheckboxExample.tsx'],
  selection: ['Mixed selection', 'CheckboxSelectionExample.tsx'],
  radio: ['Radio selection', 'RadioGroupExample.tsx']
} satisfies Record<ControlKind, readonly [string, string]>

export function ControlDemo({ kind }: { kind: ControlKind }) {
  const [title, file] = examples[kind]
  return (
    <Demo
      title={title}
      files={[
        `controls/${file}`,
        'controls/control-types.ts',
        'profile/useHydrated.ts',
        'controls/control-example.css'
      ]}
    >
      <ControlPlayground kind={kind} />
      <noscript className="demo-feedback">
        Enable JavaScript to submit this demo. You can still read and copy its source.
      </noscript>
    </Demo>
  )
}
