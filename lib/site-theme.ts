import { defineTheme, type ThemeDefinition } from '@cognitap/radiant'
import { themeDefinitions } from '@cognitap/radiant/examples'

const radiant = themeDefinitions.find(definition => definition.id === 'radiant')
if (!radiant?.tokens) throw new Error('The site theme builds on the Radiant preset.')

/**
 * The site's own chrome, in the logo's colours: graphite plates on a near-black
 * ground with peach light, warm paper in light mode. Demos keep the presets.
 */
export const siteTheme = defineTheme({
  ...radiant,
  id: 'radiant-site',
  name: 'Radiant site',
  tokens: {
    ...radiant.tokens,
    color: {
      surface: '#ffffff',
      foreground: '#24222b',
      mutedForeground: '#67636f',
      border: '#d9d3cc',
      accent: '#a84b24',
      accentForeground: '#ffffff',
      neutral: '#f3efea',
      neutralForeground: '#2d2a33',
      warning: '#efc355',
      warningForeground: '#44300c',
      danger: '#b52c34',
      dangerForeground: '#ffffff',
      focus: '#b4532a',
      placeholder: '#67636f',
      disabledBackground: '#f3efea',
      disabledBorder: '#d9d3cc',
      invalid: '#b52c34'
    },
    typography: {
      ...radiant.tokens.typography,
      family: "'Geist', ui-sans-serif, system-ui, sans-serif",
      labelWeight: 500,
      headingWeight: 500,
      letterSpacing: '-0.012em',
      roles: { code: { family: "'Geist Mono', ui-monospace, monospace" } }
    },
    control: {
      ...radiant.tokens.control,
      action: {
        fontWeight: 500,
        shadow: '0 1px 2px 0 rgb(36 34 43 / 0.08)',
        shadowPressed: '0 0 0 0 rgb(36 34 43 / 0)'
      },
      field: { shadow: '0 1px 1px 0 rgb(36 34 43 / 0.04)' },
      indicator: { thumbShadow: '0 1px 3px rgb(36 34 43 / 0.25)' },
      selected: {
        ...radiant.tokens.control?.selected,
        shadow: '0 1px 2px rgb(36 34 43 / 0.1), 0 0 0 1px rgb(36 34 43 / 0.06)'
      }
    },
    surface: {
      ...radiant.tokens.surface,
      canvas: '#faf8f5'
    }
  },
  modes: {
    dark: {
      tokens: {
        color: {
          surface: '#18191f',
          foreground: '#f7f2ec',
          mutedForeground: '#aeabb5',
          border: '#5f5c67',
          accent: '#f5b592',
          accentForeground: '#24160f',
          neutral: '#26252e',
          neutralForeground: '#f1ece6',
          warning: '#efc355',
          warningForeground: '#352507',
          danger: '#ff9298',
          dangerForeground: '#3c111a',
          focus: '#ffc7a2',
          placeholder: '#aeabb5',
          disabledBackground: '#26252e',
          disabledBorder: '#5f5c67',
          invalid: '#ff9298'
        },
        surface: {
          canvas: '#111217',
          shadow: '0 1px 4px rgb(0 0 0 / 0.4)',
          overlayShadow: '0 20px 60px rgb(0 0 0 / 0.65)',
          backdrop: 'rgb(0 0 0 / 0.65)'
        }
      }
    }
  }
} satisfies ThemeDefinition)
