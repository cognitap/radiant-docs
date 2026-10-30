import { Demo } from './demo/Demo'
import { AutocompletePlayground } from '@/examples/autocomplete/AutocompletePlayground'
export function AutocompleteDemo() {
  return (
    <Demo
      title="Plan a research topic"
      files={['autocomplete/AutocompleteExample.tsx']}
    >
      <AutocompletePlayground task="topic" />
    </Demo>
  )
}
export function AutocompleteInvitationDemo() {
  return (
    <Demo
      title="Prepare a participant invitation"
      files={['autocomplete/AutocompleteExample.tsx']}
    >
      <AutocompletePlayground task="invitation" />
    </Demo>
  )
}
export function AutocompleteDatasetDemo() {
  return (
    <Demo
      title="Find a study dataset"
      files={['autocomplete/AutocompleteExample.tsx']}
    >
      <AutocompletePlayground task="dataset" />
    </Demo>
  )
}
