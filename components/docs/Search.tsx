'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Command,
  CommandClose,
  CommandContent,
  CommandDescription,
  CommandInput,
  CommandList,
  CommandTitle,
  CommandTrigger,
  Kbd,
  KbdGroup,
  type CommandOption
} from '@cognitap/radiant'
import { useHighlightQuery, useStaticSearch } from 'fumadocs-core/search/client'
import { toJsx } from 'fumadocs-core/utils/hast-to-jsx'

export function Search() {
  const [open, setOpen] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const router = useRouter()
  const { search, onSearchChange, isLoading, data, error } = useStaticSearch({
    from: attempt === 0 ? '/search-index.json' : `/search-index.json?retry=${attempt}`,
    delayMs: 120
  })
  const highlight = useHighlightQuery(data?.query ?? '')

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== 'k'
      )
        return
      if (document.querySelector('dialog[open]')) return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, [contenteditable="true"]')
      )
        return
      event.preventDefault()
      setOpen(true)
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

  const records =
    search && data?.query === search && !error
      ? data.items.flatMap(item => (item.type === 'table' ? item.rows : [item])).slice(0, 20)
      : []
  const urls = new Map(records.map(record => [record.id, record.url]))
  const items: CommandOption[] = records.map((record, index) => ({
    value: record.id,
    label: (
      <span className="search-result-text">
        {toJsx(record.hastContent, { components: { a: props => <span>{props.children}</span> } })}
      </span>
    ),
    textValue: record.content,
    group:
      record.breadcrumbs?.join(' / ') ||
      records.slice(0, index + 1).findLast(item => item.type === 'page')?.content
  }))

  return (
    <Command
      open={open}
      onOpenChange={setOpen}
      items={items}
      query={search}
      onQueryChange={onSearchChange}
      filter={null}
      loading={search.length > 0 && !error && (isLoading || data?.query !== search)}
      loadingText="Searching…"
      errorText={error ? 'Search could not load. Try again.' : undefined}
      emptyText={search ? 'No results. Try another word.' : 'Type to search the documentation.'}
      onAction={id => {
        const url = urls.get(id)
        if (url) router.push(url)
      }}
    >
      <CommandTrigger variant="outline">
        Search docs
        <Shortcut />
      </CommandTrigger>
      <CommandContent className="docs-search-dialog">
        <CommandTitle>Search documentation</CommandTitle>
        <CommandDescription>
          Search pages and headings, then press Enter to open one.
        </CommandDescription>
        <CommandInput
          aria-label="Search documentation"
          placeholder="Search components, setup and recipes…"
        />
        <CommandList ref={highlight} />
        {error ? (
          <Button
            variant="outline"
            onClick={() => setAttempt(value => value + 1)}
          >
            Retry search
          </Button>
        ) : null}
        <CommandClose
          variant="ghost"
          tone="neutral"
        >
          Close search
        </CommandClose>
      </CommandContent>
    </Command>
  )
}

const subscribe = () => () => {}

/** The platform is unknown on the server, so the hint appears after hydration. */
function Shortcut() {
  const modifier = useSyncExternalStore(
    subscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'),
    () => null
  )
  if (!modifier) return null
  return (
    <KbdGroup
      aria-hidden="true"
      className="search-shortcut"
    >
      <Kbd>{modifier}</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
}
