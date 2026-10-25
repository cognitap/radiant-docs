'use client'

import { AnchorProvider, TOCItem, type TableOfContents } from 'fumadocs-core/toc'

export function PageOutline({ toc }: { toc: TableOfContents }) {
  if (toc.length === 0) return null
  const links = (
    <ol>
      {toc.map(item => (
        <li
          key={item.url}
          className={item.depth > 2 ? 'outline-nested' : undefined}
        >
          <TOCItem href={item.url}>{item.title}</TOCItem>
        </li>
      ))}
    </ol>
  )
  return (
    <AnchorProvider
      toc={toc}
      single
    >
      <div className="outline-mobile">
        <details>
          <summary>On this page</summary>
          <nav aria-label="On this page">{links}</nav>
        </details>
      </div>
      <aside className="outline-desktop">
        <nav aria-label="On this page">
          <p className="outline-title">On this page</p>
          {links}
        </nav>
      </aside>
    </AnchorProvider>
  )
}
