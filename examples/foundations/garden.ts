import { defineTheme, type ThemeDefinition } from '@cognitap/radiant'

// Illustrative application theme, not a supported Radiant preset.
const gardenDefinition = {
  id: 'garden-example',
  name: 'Garden (documentation example)',
  tokens: {
    color: { accent: '#166534', accentForeground: '#ffffff' },
    typography: { family: 'system-ui, sans-serif' },
    control: { radius: '1rem' },
    surface: { radius: '1.25rem' }
  },
  components: { button: { fontWeight: 650, pressScale: 0.97 } },
  modes: {
    dark: { tokens: { color: { accent: '#86efac', accentForeground: '#052e16' } } }
  }
} satisfies ThemeDefinition

export const garden = defineTheme(gardenDefinition)

export const gardenWithButtonCorners = defineTheme({
  ...gardenDefinition,
  id: 'garden-button-example',
  components: { button: { ...gardenDefinition.components.button, radius: '0.25rem' } }
})
