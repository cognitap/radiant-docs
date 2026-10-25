import { Demo } from './demo/Demo'
import { ThemeWorkshop } from '@/examples/workshop/ThemeWorkshop'

export function WorkshopDemo() {
  return (
    <Demo
      title="Shared theme workshop"
      files={[
        'workshop/ThemeWorkshop.tsx',
        'workshop/workshop-theme.ts',
        'workshop/workshop-color.ts',
        'workshop/ColorEditor.tsx',
        'workshop/color-editor.css',
        'workshop/Specimens.tsx',
        'workshop/workshop.css',
        'profile/NativeProfileForm.tsx',
        'profile/profile.ts',
        'profile/useHydrated.ts',
        'profile/profile-form.css'
      ]}
    >
      <ThemeWorkshop />
    </Demo>
  )
}
