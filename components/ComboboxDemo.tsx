import { Demo } from './demo/Demo'
import { ComboboxTravelExample } from '@/examples/combobox/ComboboxExample'
import { ComboboxAsyncExample } from '@/examples/combobox/AsyncComboboxExample'

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

export function AsyncComboboxDemo() {
  return (
    <Demo
      title="Async city search"
      files={['combobox/AsyncComboboxExample.tsx', 'combobox/cities.ts', 'profile/useHydrated.ts']}
    >
      <ComboboxAsyncExample />
      <noscript className="demo-feedback">
        Enable JavaScript to search asynchronous results. Its source is available below.
      </noscript>
    </Demo>
  )
}
