import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { source } from '@/lib/source'

export const dynamicParams = false

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()
  return { title: page.data.title, description: page.data.description }
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()
  const Content = page.data.body

  return (
    <article className="docs-page">
      <p className="eyebrow">
        {slug[0] === 'recipes' ? 'Recipes / Forms' : 'Components / Actions'}
      </p>
      <h1>{page.data.title}</h1>
      <p className="lede">{page.data.description}</p>
      <div className="prose">
        <Content />
      </div>
    </article>
  )
}
