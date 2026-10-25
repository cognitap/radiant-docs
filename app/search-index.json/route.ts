import { createFromSource } from 'fumadocs-core/search/server'
import { source } from '@/lib/source'
import { docsURL, sectionFor } from '@/lib/navigation'

export const dynamic = 'force-static'

export const { staticGET: GET } = createFromSource(source, {
  buildIndex: page => ({
    id: page.url,
    url: docsURL(page.url),
    title: page.data.title,
    description: page.data.description,
    structuredData: page.data.structuredData,
    breadcrumbs: [sectionFor(page.slugs).title]
  })
})
