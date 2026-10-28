'use client'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Named table/code regions support native keyboard scrolling. */

import { useId, type ReactNode } from 'react'
import { Button, Card, Field, Input, Link, Checkbox } from '@cognitap/radiant'
import { sceneCopy, readCopy, type CopyEdits, type PageScene } from './page-copy'
import type { PageSessions } from './workshop-preview'

export type PagePatch = <K extends PageScene>(page: K, patch: Partial<PageSessions[K]>) => void
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

/** One copy/session owner feeds every frame; components own only DOM identities. */
export function Page({
  page,
  copy,
  sessions,
  onPage
}: {
  page: PageScene
  copy: CopyEdits
  sessions: PageSessions
  onPage: PagePatch
}) {
  const id = useId()
  const text = <P extends PageScene>(scene: P, key: keyof (typeof sceneCopy)[P]) =>
    readCopy(copy, scene, key)
  const role = (name: string, children: ReactNode) => <span data-rad-text={name}>{children}</span>
  if (page === 'article')
    return (
      <article
        data-rad-prose=""
        className="scene-prose"
      >
        <header
          className="scene-stack"
          data-rad-not-prose=""
        >
          <p data-rad-text="ui-eyebrow">{text('article', 'kicker')}</p>
          <h2 data-rad-text="prose-title">{text('article', 'title')}</h2>
          <p data-rad-text="prose-lead">{text('article', 'lead')}</p>
          <p
            data-rad-text="ui-caption"
            className="scene-muted"
          >
            {text('article', 'note')}
          </p>
        </header>
        <p>
          {copy.article?.body === undefined ? (
            <>
              Start with the words people need to <em>read</em>. A useful interface makes the next
              step clear, while a longer story needs space to unfold. Both deserve the same care.
            </>
          ) : (
            text('article', 'body')
          )}
        </p>
        <h3 data-rad-text="prose-heading">{text('article', 'heading')}</h3>
        <p>{text('article', 'paragraph')}</p>
        <blockquote>{text('article', 'quote')}</blockquote>
        <h4 data-rad-text="prose-subheading">{text('article', 'subheading')}</h4>
        <ul>
          {(['listOne', 'listTwo', 'listThree'] as const).map(key => (
            <li key={key}>{text('article', key)}</li>
          ))}
        </ul>
        <section
          data-rad-not-prose=""
          className="scene-scroll"
          tabIndex={0}
          aria-label="Article code sample"
        >
          <pre data-rad-text="code">
            <code>{text('article', 'code')}</code>
          </pre>
        </section>
        <p>
          <Link href={`#${id}-note`}>{text('article', 'link')}</Link>
        </p>
        <p
          id={`${id}-note`}
          data-rad-text="prose-small"
          className="scene-muted"
        >
          An independently authored page. Inline <code>code</code> follows the surrounding
          paragraph.
        </p>
      </article>
    )
  if (page === 'form') {
    const form = sessions.form
    const nameError = form.attempted && !form.name.trim() ? 'Enter your name.' : undefined
    const emailError =
      form.attempted && !validEmail(form.email) ? 'Enter a valid email address.' : undefined
    return (
      <div
        className="scene-product"
        data-rad-text="ui-body"
      >
        <header className="scene-stack">
          <p data-rad-text="ui-eyebrow">{text('form', 'kicker')}</p>
          <h2 data-rad-text="ui-title">{text('form', 'title')}</h2>
          <p>{text('form', 'introduction')}</p>
        </header>
        <div className="scene-form-layout">
          <form
            className="scene-stack"
            aria-label="Workspace preferences"
            noValidate
            onSubmit={event => {
              event.preventDefault()
              const valid = !!form.name.trim() && validEmail(form.email)
              onPage('form', { attempted: true, saved: valid })
              if (!valid)
                event.currentTarget
                  .querySelector<HTMLInputElement>(
                    !form.name.trim() ? '[name="scene-name"]' : '[name="scene-email"]'
                  )
                  ?.focus()
            }}
          >
            <Field
              label={role('ui-label', text('form', 'name'))}
              description={role('ui-supporting', text('form', 'nameHelp'))}
              error={nameError}
              required
            >
              <Input
                name="scene-name"
                autoComplete="off"
                value={form.name}
                onChange={event => onPage('form', { name: event.target.value, saved: false })}
              />
            </Field>
            <Field
              label={role('ui-label', text('form', 'email'))}
              description={role('ui-supporting', text('form', 'emailHelp'))}
              error={emailError}
              required
            >
              <Input
                name="scene-email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={event => onPage('form', { email: event.target.value, saved: false })}
              />
            </Field>
            <Checkbox
              label={role('ui-label', text('form', 'updates'))}
              checked={form.updates}
              onChange={event => onPage('form', { updates: event.target.checked, saved: false })}
            />
            <div>
              <Button type="submit">{role('ui-label', text('form', 'save'))}</Button>
            </div>
            <output data-rad-text="ui-supporting">
              {form.saved ? `Saved locally for ${form.name}.` : text('form', 'secondary')}
            </output>
            <Link href={`#${id}-privacy`}>{role('ui-supporting', text('form', 'link'))}</Link>
          </form>
          <Card
            id={`${id}-privacy`}
            className="scene-aside"
          >
            <h3 data-rad-text="prose-subheading">{text('form', 'asideTitle')}</h3>
            <p data-rad-text="prose-body">{text('form', 'aside')}</p>
          </Card>
        </div>
      </div>
    )
  }
  if (page === 'data') {
    const { query } = sessions.data
    const rows = [
      [text('data', 'projectOne'), 'Design', 'In review', '$4,800'],
      [text('data', 'projectTwo'), 'Engineering', 'Active', '$12,400'],
      [text('data', 'projectThree'), 'Research', 'Planning', '$2,600'],
      [text('data', 'projectFour'), 'Design', 'Active', '$7,200']
    ]
      .map((cells, id) => ({ id, cells }))
      .filter(({ cells }) => cells.join(' ').toLowerCase().includes(query.toLowerCase()))
    return (
      <div
        className="scene-stack"
        data-rad-text="ui-body"
      >
        <p data-rad-text="ui-eyebrow">{text('data', 'kicker')}</p>
        <h2 data-rad-text="ui-title">{text('data', 'title')}</h2>
        <p>{text('data', 'introduction')}</p>
        <div className="scene-metrics">
          {(['revenue', 'projects'] as const).map(metric => (
            <Card
              key={metric}
              className="scene-stack"
            >
              <p data-rad-text="ui-label">{text('data', `${metric}Label`)}</p>
              <p data-rad-text="ui-metric">{text('data', metric)}</p>
              <p
                data-rad-text="ui-caption"
                className="scene-muted"
              >
                {text('data', `${metric}Note`)}
              </p>
            </Card>
          ))}
        </div>
        <Field label={role('ui-label', text('data', 'filter'))}>
          <Input
            value={query}
            onChange={event => onPage('data', { query: event.target.value })}
          />
        </Field>
        <h3
          data-rad-text="ui-title"
          id={`${id}-table`}
        >
          {text('data', 'heading')}
        </h3>
        <section
          className="scene-scroll"
          tabIndex={0}
          aria-labelledby={`${id}-table`}
        >
          <table data-rad-text="ui-supporting">
            <caption data-rad-text="ui-caption">{text('data', 'caption')}</caption>
            <thead>
              <tr>
                {(['projectColumn', 'teamColumn', 'statusColumn', 'budgetColumn'] as const).map(
                  key => (
                    <th
                      scope="col"
                      key={key}
                    >
                      {role('ui-label', text('data', key))}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, cells: row }) => (
                <tr key={id}>
                  <th scope="row">{row[0]}</th>
                  {row.slice(1).map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <output data-rad-text="ui-caption">{rows.length} projects shown.</output>
        <p
          data-rad-text="ui-supporting"
          className="scene-muted"
        >
          {text('data', 'note')}
        </p>
      </div>
    )
  }
  return (
    <div className="scene-stack scene-landing">
      <nav aria-label="Landing page navigation">
        <strong data-rad-text="ui-label">{text('landing', 'brand')}</strong>
        <Link href={`#${id}-features`}>{role('ui-label', text('landing', 'nav'))}</Link>
      </nav>
      <header className="scene-stack">
        <p data-rad-text="ui-eyebrow">{text('landing', 'kicker')}</p>
        <h2 data-rad-text="display">{text('landing', 'title')}</h2>
        <p data-rad-text="prose-lead">{text('landing', 'lead')}</p>
        <div className="scene-actions">
          <Button onClick={() => onPage('landing', { joined: true })}>
            {role('ui-label', text('landing', 'action'))}
          </Button>
          <Link href={`#${id}-features`}>{role('ui-label', text('landing', 'link'))}</Link>
        </div>
        <output data-rad-text="ui-supporting">
          {sessions.landing.joined
            ? 'You are on this page’s local list.'
            : 'Try an action. No signup is sent.'}
        </output>
      </header>
      <section
        id={`${id}-features`}
        data-rad-prose=""
      >
        <h3 data-rad-text="prose-heading">{text('landing', 'heading')}</h3>
        <p>{text('landing', 'body')}</p>
      </section>
      <div className="scene-metrics">
        {(['One', 'Two'] as const).map(key => (
          <Card
            key={key}
            className="scene-stack"
          >
            <h3 data-rad-text="ui-title">{text('landing', `feature${key}`)}</h3>
            <p data-rad-text="ui-body">{text('landing', `feature${key}Body`)}</p>
          </Card>
        ))}
      </div>
      <footer
        data-rad-text="ui-caption"
        className="scene-muted"
      >
        {text('landing', 'note')}
      </footer>
    </div>
  )
}
