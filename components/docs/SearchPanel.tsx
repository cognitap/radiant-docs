'use client'

import { useEffect, useRef, useState } from 'react'
import NextLink from 'next/link'
import { Button, Field, Input, Link } from '@cognitap/radiant'
import { useHighlightQuery, useStaticSearch } from 'fumadocs-core/search/client'
import { toJsx } from 'fumadocs-core/utils/hast-to-jsx'

export function SearchPanel({ onNavigate }: { onNavigate: () => void }) {
  const [attempt, setAttempt] = useState(0)
  const { search, onSearchChange, isLoading, data, error } = useStaticSearch({
    from: attempt === 0 ? '/search-index.json' : `/search-index.json?retry=${attempt}`,
    delayMs: 120
  })
  const input = useRef<HTMLInputElement>(null)
  const results = useRef<HTMLUListElement>(null)
  const highlight = useHighlightQuery(data?.query ?? '')
  useEffect(() => input.current?.focus(), [])

  const records =
    data?.query === search && !isLoading && !error
      ? data.items.flatMap(item => (item.type === 'table' ? item.rows : [item])).slice(0, 20)
      : []
  const entries = records.map((record, index) => ({
    ...record,
    context:
      record.breadcrumbs?.join(' / ') ||
      records.slice(0, index + 1).findLast(item => item.type === 'page')?.content
  }))
  const feedback =
    search.length === 0
      ? 'Type to search the documentation.'
      : isLoading
        ? 'Searching…'
        : error
          ? 'Search could not load. Try again or use the documentation menu.'
          : records.length === 0
            ? 'No results. Try another word.'
            : `${records.length} ${records.length === 1 ? 'result' : 'results'}.`

  return (
    <div className="search-panel">
      <Field
        label="Search documentation"
        description="Find components, setup guidance and recipes."
      >
        <Input
          ref={input}
          type="search"
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          onKeyDown={event => {
            if ((event.key === 'ArrowDown' || event.key === 'Enter') && records.length > 0) {
              event.preventDefault()
              results.current?.querySelector<HTMLAnchorElement>('a')?.focus()
            }
          }}
        />
      </Field>
      <output className="search-status">{feedback}</output>
      {error && !isLoading ? (
        <Button
          variant="outline"
          onClick={() => setAttempt(value => value + 1)}
        >
          Retry search
        </Button>
      ) : null}
      <div
        className="search-results-scroll"
        ref={highlight}
        key={data?.query}
        aria-busy={isLoading}
      >
        <ul
          ref={results}
          className="search-results"
          aria-label="Search results"
        >
          {entries.map((record, index) => (
            <li key={record.id}>
              <Link
                render={props => (
                  <NextLink
                    {...props}
                    href={props.href ?? record.url}
                  />
                )}
                href={record.url}
                onClick={onNavigate}
                onKeyDown={event => {
                  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
                  event.preventDefault()
                  const links = results.current?.querySelectorAll<HTMLAnchorElement>('a')
                  if (event.key === 'ArrowUp' && index === 0) input.current?.focus()
                  else links?.[index + (event.key === 'ArrowDown' ? 1 : -1)]?.focus()
                }}
              >
                {record.context ? (
                  <span
                    className="search-breadcrumbs"
                    data-highlight-ignore
                  >
                    {record.context}
                  </span>
                ) : null}
                <span className="search-result-text">
                  {toJsx(record.hastContent, {
                    components: { a: props => <span>{props.children}</span> }
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
