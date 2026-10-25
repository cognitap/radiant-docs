import { Demo } from './demo/Demo'
import {
  FoundationPlayground,
  type FoundationKind
} from '@/examples/foundations/FoundationPlayground'

const titles = {
  setup: 'Your first action',
  presets: 'Supported presets',
  authoring: 'Author a theme',
  scopes: 'Nested theme scopes'
}

export function FoundationDemo({ kind }: { kind: FoundationKind }) {
  return (
    <Demo
      title={titles[kind]}
      files={[
        ...(kind === 'setup'
          ? ['foundations/FollowButton.tsx']
          : [
              kind === 'scopes' ? 'foundations/NestedScopes.tsx' : 'foundations/ThemeExample.tsx',
              ...(kind === 'authoring' ? ['foundations/garden.ts'] : []),
              'foundations/foundation-example.css'
            ]),
        'profile/useHydrated.ts'
      ]}
    >
      <FoundationPlayground kind={kind} />
      <noscript className="demo-feedback">
        Source and initial previews are available without JavaScript. Enable it for theme controls
        and local actions.
      </noscript>
    </Demo>
  )
}
