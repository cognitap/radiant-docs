import { source } from './source'

export const sections = [
  { id: 'getting-started', title: 'Getting started' },
  { id: 'foundations', title: 'Foundations' },
  { id: 'workshop', title: 'Workshop' },
  { id: 'components', title: 'Components' },
  { id: 'recipes', title: 'Recipes' },
  { id: 'releases', title: 'Releases' }
] as const

export type NavigationGroup = {
  title: string
  pages: { title: string; url: string }[]
}

export function sectionFor(slugs: string[]) {
  return (
    sections.find(section => section.id === slugs[0]) ??
    sections.find(section => section.id === 'components')!
  )
}

export function docsURL(url: string) {
  return `${url.replace(/\/$/, '')}/`
}

export function getNavigation(): NavigationGroup[] {
  const pages = source.getPages()
  return sections.map(section => ({
    title: section.title,
    pages: pages
      .filter(page => sectionFor(page.slugs).id === section.id)
      .map(page => ({ title: page.data.title, url: docsURL(page.url) }))
      .sort((a, b) => a.title.localeCompare(b.title))
  }))
}
