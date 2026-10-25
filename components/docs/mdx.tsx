import type { ComponentProps, ReactNode } from 'react'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable table region needs keyboard access. */

export function Callout({ title = 'Note', children }: { title?: string; children: ReactNode }) {
  return (
    <aside
      className="mdx-callout"
      aria-label={title}
    >
      <p className="callout-title">{title}</p>
      {children}
    </aside>
  )
}

function Table(props: ComponentProps<'table'>) {
  return (
    <section
      className="mdx-table-scroll"
      aria-label="Data table"
      tabIndex={0}
    >
      <table {...props} />
    </section>
  )
}

export const mdxComponents = { Callout, table: Table }
