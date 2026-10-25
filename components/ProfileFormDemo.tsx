import { Demo } from './demo/Demo'
import { ProfilePlayground } from '@/examples/profile/ProfilePlayground'
import type { FormPlacement } from '@/examples/profile/ProfileRecipe'

export function ProfileFormDemo({
  compare = false,
  placement
}: {
  compare?: boolean
  placement?: FormPlacement
}) {
  return (
    <Demo
      title={compare ? 'Compare configurations' : 'Profile editor'}
      files={[
        'profile/ProfileRecipe.tsx',
        'profile/NativeProfileForm.tsx',
        'profile/TanStackProfileForm.tsx',
        'profile/profile.ts',
        'profile/useHydrated.ts',
        'profile/profile-form.css'
      ]}
    >
      <ProfilePlayground
        compare={compare}
        defaultPlacement={placement}
      />
    </Demo>
  )
}
