import { source } from './source'

export const sections = [
  { id: 'getting-started', title: 'Getting started' },
  { id: 'foundations', title: 'Foundations' },
  { id: 'workshop', title: 'Workshop' },
  { id: 'components', title: 'Components' },
  { id: 'recipes', title: 'Recipes' },
  { id: 'releases', title: 'Releases' }
] as const

export const categories = [
  {
    title: 'Actions',
    description: 'Buttons and the bars that group them.',
    slugs: ['button', 'button-group', 'toggle-group', 'toolbar']
  },
  {
    title: 'Inputs',
    description: 'Text, numbers, codes, files and ranges.',
    slugs: [
      'input',
      'input-group',
      'textarea',
      'password-input',
      'number-field',
      'otp-field',
      'file-input',
      'slider'
    ]
  },
  {
    title: 'Choices',
    description: 'Pick one or many options from a set.',
    slugs: [
      'checkbox',
      'checkbox-group',
      'radio-group',
      'switch',
      'select',
      'native-select',
      'multi-select',
      'combobox',
      'autocomplete',
      'tags-input'
    ]
  },
  {
    title: 'Forms',
    description: 'Labels, descriptions, errors and submission.',
    slugs: ['form', 'field', 'fieldset']
  },
  {
    title: 'Navigation',
    description: 'Move between pages and views.',
    slugs: ['link', 'nav-link', 'navigation-menu', 'breadcrumb', 'pagination', 'tabs']
  },
  {
    title: 'Menus',
    description: 'Lists of commands that open on demand.',
    slugs: ['menu', 'context-menu', 'menubar', 'command']
  },
  {
    title: 'Overlays',
    description: 'Content that floats above the page.',
    slugs: ['dialog', 'alert-dialog', 'drawer', 'popover', 'hover-card', 'tooltip']
  },
  {
    title: 'Feedback',
    description: 'Status, progress and loading states.',
    slugs: ['alert', 'toast', 'progress', 'meter', 'spinner', 'skeleton', 'empty-state']
  },
  {
    title: 'Data display',
    description: 'Show records, media, code and charts.',
    slugs: ['card', 'table', 'charts', 'avatar', 'badge', 'tag', 'kbd', 'code-block', 'carousel']
  },
  {
    title: 'Layout',
    description: 'Structure, spacing and disclosure.',
    slugs: [
      'app-shell',
      'aspect-ratio',
      'separator',
      'scroll-area',
      'resizable',
      'accordion',
      'collapsible'
    ]
  }
] as const

export type NavigationGroup = {
  title: string
  description?: string
  pages: { title: string; url: string }[]
}

type Page = ReturnType<typeof source.getPages>[number]

function sectionId(slugs: string[]) {
  return sections.find(section => section.id === slugs[0])?.id ?? 'components'
}

function categoryFor(slugs: string[]) {
  const category = categories.find(category =>
    (category.slugs as readonly string[]).includes(slugs[0])
  )
  if (!category) throw new Error(`Add /docs/${slugs.join('/')}/ to a category in lib/navigation.ts`)
  return category
}

export function sectionFor(slugs: string[]) {
  const id = sectionId(slugs)
  if (id === 'components') return { id, title: categoryFor(slugs).title }
  return sections.find(section => section.id === id)!
}

export function docsURL(url: string) {
  return `${url.replace(/\/$/, '')}/`
}

function link(page: Page) {
  return { title: page.data.title, url: docsURL(page.url) }
}

function byTitle(a: { title: string }, b: { title: string }) {
  return a.title.localeCompare(b.title)
}

export function getComponentCategories(): NavigationGroup[] {
  const pages = source.getPages().filter(page => sectionId(page.slugs) === 'components')
  const known = new Set<string>(categories.flatMap(category => category.slugs))
  for (const page of pages) categoryFor(page.slugs)
  for (const slug of known) {
    if (!pages.some(page => page.slugs[0] === slug))
      throw new Error(`lib/navigation.ts lists ${slug}, which has no page`)
  }
  return categories.map(category => ({
    title: category.title,
    description: category.description,
    pages: pages
      .filter(page => categoryFor(page.slugs) === category)
      .map(link)
      .sort(byTitle)
  }))
}

export function getNavigation(): NavigationGroup[] {
  const pages = source.getPages()
  return sections.flatMap(section =>
    section.id === 'components'
      ? getComponentCategories()
      : [
          {
            title: section.title,
            pages: pages
              .filter(page => sectionId(page.slugs) === section.id)
              .map(link)
              .sort(byTitle)
          }
        ]
  )
}
