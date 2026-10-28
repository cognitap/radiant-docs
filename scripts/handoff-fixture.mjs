import {
  generateColorWall,
  recommendColorPalette,
  themeDocumentFromDefinition,
  updateThemeAppearance,
  updateThemeDocument
} from '@cognitap/radiant'
import { geometryPreset } from '../examples/workshop/workshop-geometry.ts'
export function handoffFixture() {
  const color = {
    input: {
      brand: '#166534',
      wallPreset: 'expressive',
      rampPreset: 'classic',
      fidelity: 'unanchored',
      lightness: 'shared',
      vividness: 0.65,
      brandVividness: 0.35
    },
    working: { primary: 'teal', support: 'orange' },
    modes: { dark: { canvas: '#112233' } }
  }
  const geometry = geometryPreset('spacious')
  geometry.modes.dark = { ...geometry.modes.dark, density: 0.9, elevation: 0 }
  let document = themeDocumentFromDefinition({
    id: 'handoff-proof',
    name: 'Handoff proof',
    motion: {
      mode: 'system',
      spring: { stiffness: 280, damping: 22, mass: 1.2 },
      interactions: { press: { stiffness: 410 }, follow: { damping: 18 } }
    },
    tokens: {
      typography: { family: '"Local Display", serif', bodySize: '1rem' },
      motion: {
        pressDuration: '93ms',
        releaseDuration: '237ms',
        releaseEase: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
        colorDuration: '170ms',
        disclosureDuration: '210ms'
      },
      focus: { width: '3px' },
      control: { medium: { fontSize: '1.1rem' } }
    },
    components: {
      button: { radius: '27px', pressScale: 0.94 },
      input: { radius: '19px' },
      dialog: { backdropFilter: 'blur(8px)' }
    },
    modes: { dark: { components: { card: { shadow: 'none' } } } }
  })
  document = updateThemeAppearance(document, {
    palette: recommendColorPalette(generateColorWall(color.input), {
      working: color.working,
      modes: color.modes
    }),
    geometry
  })
  document = updateThemeDocument(document, {
    typography: {
      fonts: [
        {
          id: 'local-display',
          family: 'Local Display',
          source: 'local',
          weights: [400, 700],
          styles: ['normal', 'italic']
        }
      ]
    }
  })
  return { document, recipes: { color, geometry } }
}
