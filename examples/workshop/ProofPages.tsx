'use client'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Named table/code regions support native keyboard scrolling. */

import { useId, type ReactNode } from 'react'
import { Button, Card, Field, Input, Link, Checkbox } from '@cognitap/radiant'
import { proofCopy, readCopy, type CopyEdits, type Proof } from './proof-content'

export interface ProofInteraction {
  name: string
  email: string
  updates: boolean
  saved: boolean
  attempted: boolean
  query: string
  joined: boolean
}
export function initialProofInteraction(): ProofInteraction {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    updates: true,
    saved: false,
    attempted: false,
    query: '',
    joined: false
  }
}

/** One content/state owner feeds every frame; components own only DOM identities. */
export function ProofPage({
  proof,
  edits,
  interaction,
  onInteraction
}: {
  proof: Proof
  edits: CopyEdits
  interaction: ProofInteraction
  onInteraction: (patch: Partial<ProofInteraction>) => void
}) {
  const id = useId()
  const text = <P extends Proof>(page: P, key: keyof (typeof proofCopy)[P]) =>
    readCopy(edits, page, key)
  const role = (name: string, children: ReactNode) => <span data-rad-text={name}>{children}</span>
  if (proof === 'article')
    return (
      <article
        data-rad-prose=""
        className="proof-prose"
      >
        <header
          className="proof-stack"
          data-rad-not-prose=""
        >
          <p data-rad-text="ui-eyebrow">{text('article', 'kicker')}</p>
          <h2 data-rad-text="prose-title">{text('article', 'title')}</h2>
          <p data-rad-text="prose-lead">{text('article', 'lead')}</p>
          <p
            data-rad-text="ui-caption"
            className="proof-muted"
          >
            {text('article', 'note')}
          </p>
        </header>
        <p>
          {edits.article?.body === undefined ? (
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
          className="proof-scroll"
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
          className="proof-muted"
        >
          An independently authored specimen. Inline <code>code</code> follows the surrounding
          paragraph.
        </p>
      </article>
    )
  if (proof === 'form') {
    const nameError =
      interaction.attempted && !interaction.name.trim() ? 'Enter your name.' : undefined
    const emailError =
      interaction.attempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interaction.email)
        ? 'Enter a valid email address.'
        : undefined
    return (
      <div
        className="proof-product"
        data-rad-text="ui-body"
      >
        <header className="proof-stack">
          <p data-rad-text="ui-eyebrow">{text('form', 'kicker')}</p>
          <h2 data-rad-text="ui-title">{text('form', 'title')}</h2>
          <p>{text('form', 'introduction')}</p>
        </header>
        <div className="proof-form-layout">
          <form
            className="proof-stack"
            aria-label="Typography preferences"
            noValidate
            onSubmit={event => {
              event.preventDefault()
              const valid =
                !!interaction.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interaction.email)
              onInteraction({ attempted: true, saved: valid })
              if (!valid)
                event.currentTarget
                  .querySelector<HTMLInputElement>(
                    !interaction.name.trim() ? '[name="proof-name"]' : '[name="proof-email"]'
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
                name="proof-name"
                autoComplete="off"
                value={interaction.name}
                onChange={event => onInteraction({ name: event.target.value, saved: false })}
              />
            </Field>
            <Field
              label={role('ui-label', text('form', 'email'))}
              description={role('ui-supporting', text('form', 'emailHelp'))}
              error={emailError}
              required
            >
              <Input
                name="proof-email"
                type="email"
                autoComplete="off"
                value={interaction.email}
                onChange={event => onInteraction({ email: event.target.value, saved: false })}
              />
            </Field>
            <Checkbox
              label={role('ui-label', text('form', 'updates'))}
              checked={interaction.updates}
              onChange={event => onInteraction({ updates: event.target.checked, saved: false })}
            />
            <div>
              <Button type="submit">{role('ui-label', text('form', 'save'))}</Button>
            </div>
            <output data-rad-text="ui-supporting">
              {interaction.saved
                ? `Saved locally for ${interaction.name}.`
                : text('form', 'secondary')}
            </output>
            <Link href={`#${id}-privacy`}>{role('ui-supporting', text('form', 'link'))}</Link>
          </form>
          <Card
            id={`${id}-privacy`}
            className="proof-aside"
          >
            <h3 data-rad-text="prose-subheading">{text('form', 'asideTitle')}</h3>
            <p data-rad-text="prose-body">{text('form', 'aside')}</p>
          </Card>
        </div>
      </div>
    )
  }
  if (proof === 'data') {
    const rows = [
      [text('data', 'projectOne'), 'Design', 'In review', '$4,800'],
      [text('data', 'projectTwo'), 'Engineering', 'Active', '$12,400'],
      [text('data', 'projectThree'), 'Research', 'Planning', '$2,600'],
      [text('data', 'projectFour'), 'Design', 'Active', '$7,200']
    ].filter(row => row.join(' ').toLowerCase().includes(interaction.query.toLowerCase()))
    return (
      <div
        className="proof-stack"
        data-rad-text="ui-body"
      >
        <p data-rad-text="ui-eyebrow">{text('data', 'kicker')}</p>
        <h2 data-rad-text="ui-title">{text('data', 'title')}</h2>
        <p>{text('data', 'introduction')}</p>
        <div className="proof-metrics">
          {(['revenue', 'projects'] as const).map(metric => (
            <Card
              key={metric}
              className="proof-stack"
            >
              <p data-rad-text="ui-label">{text('data', `${metric}Label`)}</p>
              <p data-rad-text="ui-metric">{text('data', metric)}</p>
              <p
                data-rad-text="ui-caption"
                className="proof-muted"
              >
                {text('data', `${metric}Note`)}
              </p>
            </Card>
          ))}
        </div>
        <Field label={role('ui-label', text('data', 'filter'))}>
          <Input
            value={interaction.query}
            onChange={event => onInteraction({ query: event.target.value })}
          />
        </Field>
        <h3
          data-rad-text="ui-title"
          id={`${id}-table`}
        >
          {text('data', 'heading')}
        </h3>
        <section
          className="proof-scroll"
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
              {rows.map(row => (
                <tr key={row[0]}>
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
          className="proof-muted"
        >
          {text('data', 'note')}
        </p>
      </div>
    )
  }
  return (
    <div className="proof-stack proof-landing">
      <nav aria-label="Landing proof navigation">
        <strong data-rad-text="ui-label">{text('landing', 'brand')}</strong>
        <Link href={`#${id}-features`}>{role('ui-label', text('landing', 'nav'))}</Link>
      </nav>
      <header className="proof-stack">
        <p data-rad-text="ui-eyebrow">{text('landing', 'kicker')}</p>
        <h2 data-rad-text="display">{text('landing', 'title')}</h2>
        <p data-rad-text="prose-lead">{text('landing', 'lead')}</p>
        <div className="proof-actions">
          <Button onClick={() => onInteraction({ joined: true })}>
            {role('ui-label', text('landing', 'action'))}
          </Button>
          <Link href={`#${id}-features`}>{role('ui-label', text('landing', 'link'))}</Link>
        </div>
        <output data-rad-text="ui-supporting">
          {interaction.joined
            ? 'You are on this specimen’s local list.'
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
      <div className="proof-metrics">
        {(['One', 'Two'] as const).map(key => (
          <Card
            key={key}
            className="proof-stack"
          >
            <h3 data-rad-text="ui-title">{text('landing', `feature${key}`)}</h3>
            <p data-rad-text="ui-body">{text('landing', `feature${key}Body`)}</p>
          </Card>
        ))}
      </div>
      <footer
        data-rad-text="ui-caption"
        className="proof-muted"
      >
        {text('landing', 'note')}
      </footer>
    </div>
  )
}
