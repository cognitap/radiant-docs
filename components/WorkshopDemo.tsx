import { Demo } from './demo/Demo'
import { ThemeWorkshop } from '@/examples/workshop/ThemeWorkshop'

export function WorkshopDemo() {
  return (
    <Demo
      title="Shared theme workshop"
      files={[
        'workshop/ThemeWorkshop.tsx',
        'workshop/workshop-theme.ts',
        'workshop/workshop-preview.ts',
        'workshop/Preview.tsx',
        'workshop/PreviewFrame.tsx',
        'workshop/preview-tools.tsx',
        'workshop/PageScenes.tsx',
        'workshop/page-copy.ts',
        'workshop/ComponentScene.tsx',
        'workshop/TypographyTools.tsx',
        'workshop/preview.css',
        'workshop/MotionEditor.tsx',
        'workshop/MotionScenes.tsx',
        'workshop/MotionInspector.tsx',
        'workshop/workshop-motion.ts',
        'workshop/motion-editor.css',
        'workshop/TypographyEditor.tsx',
        'workshop/workshop-typography.ts',
        'workshop/typography-editor.css',
        'workshop/FontEditor.tsx',
        'workshop/workshop-fonts.ts',
        'workshop/font-requirements.ts',
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
        'workshop/workshop.css',
        'profile/useHydrated.ts'
      ]}
    >
      <ThemeWorkshop />
    </Demo>
  )
}
