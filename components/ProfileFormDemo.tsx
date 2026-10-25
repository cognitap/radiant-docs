import { Demo } from './demo/Demo'
import { ProfilePlayground } from '@/examples/profile/ProfilePlayground'

export function ProfileFormDemo({ compare = false }: { compare?: boolean }) {
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
      <ProfilePlayground compare={compare} />
    </Demo>
  )
}
