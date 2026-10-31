import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { source } from '@/lib/source'
import { sectionFor } from '@/lib/navigation'
import { PageOutline } from '@/components/docs/PageOutline'
import { mdxComponents } from '@/components/docs/mdx'

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
    <div className="docs-layout">
      <div className="docs-page">
        <article>
          <p className="eyebrow">{sectionFor(slug).title}</p>
          <h1>{page.data.title}</h1>
          <p className="lede">{page.data.description}</p>
          <div className="prose">
            <Content components={mdxComponents} />
          </div>
        </article>
      </div>
      <PageOutline toc={page.data.toc} />
    </div>
  )
}
