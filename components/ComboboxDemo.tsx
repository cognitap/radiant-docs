import { Demo } from './demo/Demo'
import { ComboboxTravelExample } from '@/examples/combobox/ComboboxExample'
import { ComboboxAsyncExample } from '@/examples/combobox/AsyncComboboxExample'
import { ComboboxControlledExample } from '@/examples/combobox/ControlledComboboxExample'
import { ComboboxMultipleExample } from '@/examples/combobox/MultipleComboboxExample'

export function ComboboxDemo() {
  return (
    <Demo
      title="A change of scenery"
      files={['combobox/ComboboxExample.tsx', 'combobox/cities.ts', 'profile/useHydrated.ts']}
    >
      <ComboboxTravelExample />
      <noscript className="demo-feedback">
        Enable JavaScript to search cities or save this demo. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function ControlledComboboxDemo() {
  return (
    <Demo
      title="Clear a choice from outside"
      files={[
        'combobox/ControlledComboboxExample.tsx',
        'combobox/cities.ts',
        'profile/useHydrated.ts'
      ]}
    >
      <ComboboxControlledExample />
      <noscript className="demo-feedback">
        Enable JavaScript to change the meeting city. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function MultipleComboboxDemo() {
  return (
    <Demo
      title="Choose several cities"
      files={[
        'combobox/MultipleComboboxExample.tsx',
        'combobox/cities.ts',
        'profile/useHydrated.ts'
      ]}
    >
      <ComboboxMultipleExample />
      <noscript className="demo-feedback">
        Enable JavaScript to edit the shortlist. Its source is available below.
      </noscript>
    </Demo>
  )
}

export function AsyncComboboxDemo() {
  return (
    <Demo
      title="Search results from a server"
      files={['combobox/AsyncComboboxExample.tsx', 'combobox/cities.ts', 'profile/useHydrated.ts']}
    >
      <ComboboxAsyncExample />
      <noscript className="demo-feedback">
        Enable JavaScript to search asynchronous results. Its source is available below.
      </noscript>
    </Demo>
  )
}
