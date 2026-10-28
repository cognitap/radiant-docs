import type { Metadata } from 'next'
import NextLink from 'next/link'
import { WorkshopDemo } from '@/components/WorkshopDemo'

export const metadata: Metadata = {
  title: 'Theme workshop',
  description: 'Build a color system, typeset pages and tune physical motion in one theme.'
}

export default function WorkshopPage() {
  return (
    <main
      className="workshop-page"
      id="content"
      tabIndex={-1}
    >
      <header className="workshop-intro">
        <h1>Theme workshop</h1>
        <p className="lede">
          Edit one Radiant theme, then take it into your app.{' '}
          <NextLink href="/docs/workshop/">Read the guide</NextLink>
        </p>
      </header>
      <WorkshopDemo />
    </main>
  )
}
