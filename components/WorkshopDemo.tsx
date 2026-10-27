import { Demo } from './demo/Demo'
import { ThemeWorkshop } from '@/examples/workshop/ThemeWorkshop'

export function WorkshopDemo() {
  return (
    <Demo
      title="Shared theme workshop"
      files={[
        'workshop/ThemeWorkshop.tsx',
        'workshop/workshop-theme.ts',
        'workshop/FontEditor.tsx',
        'workshop/workshop-fonts.ts',
        'workshop/font-runtime.ts',
        'workshop/font-editor.css',
        'workshop/workshop-color.ts',
        'workshop/ColorEditor.tsx',
        'workshop/color-editor.css',
        'workshop/GeometryEditor.tsx',
        'workshop/workshop-geometry.ts',
        'workshop/geometry-editor.css',
        'workshop/ThemeHandoff.tsx',
        'workshop/workshop-handoff.ts',
        'workshop/workshop-share.ts',
        'workshop/theme-handoff.css',
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
