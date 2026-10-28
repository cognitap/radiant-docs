import { errorMessage, handoffAPI, type PortableDocument } from './workshop-handoff.ts'
import { fontRequirements, fontSetup, type FontRequirement } from './font-requirements.ts'

export type Setup = 'react' | 'css' | 'tailwind'
export interface SetupChoice {
  id: Setup
  label: string
  hint: string
}
export const setups: readonly SetupChoice[] = [
  { id: 'react', label: 'React', hint: 'ThemeScope in a React app, with spring motion' },
  { id: 'css', label: 'CSS', hint: 'One stylesheet for any site, no build step' },
  { id: 'tailwind', label: 'Tailwind', hint: 'A Tailwind 4 build with Radiant’s source entry' }
]
export interface SetupFile {
  label: string
  name: string
  type: string
  text: string
}
export interface SetupStep {
  text: string
  /** Names the snippet for its copy button and field; absent when the step is text only. */
  label?: string
  code?: string
  /** The step lists the theme's font requirements beside its code. */
  fonts?: boolean
}
export interface SetupGuide {
  setup: Setup
  output: SetupFile
  /** Set when the theme cannot be written in this format; the output text is then empty. */
  error: string
  steps: SetupStep[]
  fonts: FontRequirement[]
}

/** Spring motion needs the React runtime; a theme with motion off needs ThemeScope alone. */
export function springMotion(document: PortableDocument): boolean {
  return document.sections.motion?.profile?.mode !== 'off'
}

const wrapperMarkup = `<div class="radiant-export" data-rad-mode="system">\n  …\n</div>\n`
const themeScopeSource = `import type { ReactNode } from 'react'\nimport { ThemeScope } from '@cognitap/radiant'\nimport { theme } from './radiant-theme'\nimport '@cognitap/radiant/styles.css'\n\nexport function RadiantTheme({ children }: { children?: ReactNode }) {\n  return (\n    <ThemeScope theme={theme} mode="system">\n      {children}\n    </ThemeScope>\n  )\n}\n`

function cssFile(document: PortableDocument): Pick<SetupFile, 'text'> & { error: string } {
  try {
    return { text: handoffAPI.cssOutput(document), error: '' }
  } catch (error) {
    return { text: '', error: errorMessage(error) }
  }
}

export function setupGuide(setup: Setup, document: PortableDocument): SetupGuide {
  const fonts = fontRequirements(document)
  const springs = springMotion(document)
  const fontStep: SetupStep[] = fonts.length
    ? [
        {
          text: 'Load the theme’s fonts in your app. Font files stay local.',
          label: 'Font setup CSS',
          code: fontSetup(document),
          fonts: true
        }
      ]
    : []
  if (setup === 'react') {
    const runtime = handoffAPI.runtimeSetup()
    return {
      setup,
      output: {
        label: 'Typed theme',
        name: 'radiant-theme.ts',
        type: 'text/typescript',
        text: handoffAPI.typedTheme(document)
      },
      error: '',
      fonts,
      steps: [
        { text: 'Install Radiant and React.', label: 'Install command', code: runtime.install },
        { text: 'Save the theme as radiant-theme.ts in your app.' },
        springs
          ? {
              text: 'Save this beside it as RadiantMotion.tsx and render your app inside RadiantMotion.',
              label: 'Runtime setup',
              code: runtime.source
            }
          : {
              text: 'Save this beside it as RadiantTheme.tsx and render your app inside RadiantTheme.',
              label: 'Theme scope',
              code: themeScopeSource
            },
        ...fontStep
      ]
    }
  }
  const css = cssFile(document)
  const entry =
    setup === 'css'
      ? {
          text: 'Load Radiant’s styles, then the theme.',
          label: 'Stylesheet imports',
          code: `@import '@cognitap/radiant/styles.css';\n@import './radiant-theme.css';\n`
        }
      : {
          text: 'Import Radiant’s source entry after Tailwind, then the theme. Without Preflight, use Tailwind’s separate imports.',
          label: 'Tailwind entry',
          code: `@import 'tailwindcss';\n@import '@cognitap/radiant/tailwind.css';\n@import './radiant-theme.css';\n`
        }
  return {
    setup,
    output: { label: 'Theme CSS', name: 'radiant-theme.css', type: 'text/css', text: css.text },
    error: css.error,
    fonts,
    steps: [
      {
        text: 'Install Radiant.',
        label: 'Install command',
        code: handoffAPI.installCommand(false)
      },
      { text: 'Save the theme as radiant-theme.css in your app.' },
      entry,
      {
        text: 'Put the class and data-rad-mode="light", "dark" or "system" on a plain wrapper.',
        label: 'Wrapper markup',
        code: wrapperMarkup
      },
      ...fontStep,
      ...(springs
        ? [
            {
              text: 'This CSS carries timing tokens only. Spring profiles need the React runtime: choose React for spring motion.'
            }
          ]
        : [])
    ]
  }
}
