'use client'

/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The semantic table region needs keyboard scrolling. */

import { useId, useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Checkbox,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Field,
  Input,
  Link,
  RadioGroup,
  Radio
} from '@cognitap/radiant'
import { NativeProfileForm } from '../profile/NativeProfileForm'
import '../profile/profile-form.css'

export type Specimen = 'article' | 'form' | 'dashboard' | 'landing' | 'components'
export type InspectionState = 'rest' | 'invalid' | 'disabled' | 'pending'
export const specimens: { id: Specimen; label: string }[] = [
  { id: 'article', label: 'Article' },
  { id: 'form', label: 'Form' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'landing', label: 'Landing page' },
  { id: 'components', label: 'Components' }
]

export function ArticleSpecimen() {
  const note = useId()
  return (
    <article className="workshop-article">
      <p className="workshop-kicker">Field notes · Issue 04</p>
      <h3>Make room for the useful things.</h3>
      <p className="workshop-intro">
        A coherent system lets small decisions support a larger idea.
      </p>
      <p>
        Start with the words people need to read. Give actions a clear place, let supporting
        information stay quiet, and keep the next step within reach.
      </p>
      <h4>A rhythm that travels</h4>
      <p>
        Short labels and long passages ask different things of a typeface. Check both before
        choosing the scale that will carry your product.
      </p>
      <blockquote>“The details should make the whole easier to understand.”</blockquote>
      <ul>
        <li>Read a paragraph at a comfortable width.</li>
        <li>Compare a heading with a quiet caption.</li>
        <li>Follow a link with the keyboard.</li>
      </ul>
      <p>
        <Link href={`#${note}`}>Read the editorial note</Link>
      </p>
      <small id={note}>An independently authored specimen. Content is illustrative.</small>
    </article>
  )
}

export function FormSpecimen() {
  const [saved, setSaved] = useState('')
  return (
    <div className="workshop-stack">
      <h3>Profile preferences</h3>
      <NativeProfileForm
        onSave={profile => setSaved(`Saved locally for ${profile.displayName}.`)}
        onReset={() => setSaved('')}
      />
      <output>{saved || 'Nothing is sent to a server.'}</output>
    </div>
  )
}

export function DashboardSpecimen() {
  const [query, setQuery] = useState('')
  const heading = useId()
  const rows = [
    ['Atlas', 'Design', 'In review', '$4,800'],
    ['Bramble', 'Engineering', 'Active', '$12,400'],
    ['Cedar', 'Research', 'Planning', '$2,600'],
    ['Dune', 'Design', 'Active', '$7,200']
  ]
  return (
    <div className="workshop-stack">
      <h3>Project overview</h3>
      <div className="workshop-metrics">
        <Card>
          <CardHeader>
            <CardTitle level={4}>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            $27,000 <small>this month</small>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={4}>Active projects</CardTitle>
          </CardHeader>
          <CardContent>
            12 <small>across four teams</small>
          </CardContent>
        </Card>
      </div>
      <Field label="Filter projects">
        <Input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search by project or team"
        />
      </Field>
      <h4 id={heading}>Team activity</h4>
      <section
        className="workshop-table-scroll"
        tabIndex={0}
        aria-labelledby={heading}
      >
        <table>
          <caption>Current projects and monthly budgets</caption>
          <thead>
            <tr>
              <th scope="col">Project</th>
              <th scope="col">Team</th>
              <th scope="col">Status</th>
              <th scope="col">Budget</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase()))
              .map(row => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
      <output>
        {rows.filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase())).length}{' '}
        projects shown.
      </output>
    </div>
  )
}

export function LandingSpecimen() {
  const [joined, setJoined] = useState(false)
  const features = useId()
  return (
    <div className="workshop-landing workshop-stack">
      <nav aria-label="Specimen navigation">
        <strong>Common ground</strong>
        <Link href={`#${features}`}>Our approach</Link>
      </nav>
      <p className="workshop-kicker">A place to begin</p>
      <h3>Build something worth coming back to.</h3>
      <p className="workshop-intro">Thoughtful tools for teams who care about the details.</p>
      <div className="workshop-actions">
        <Button onClick={() => setJoined(true)}>Join the list</Button>
        <Link
          href={`#${features}`}
          variant="outline"
        >
          Explore the idea
        </Link>
      </div>
      <output>
        {joined ? 'You are on this specimen’s local list.' : 'Try an action. No signup is sent.'}
      </output>
      <div
        id={features}
        className="workshop-metrics"
      >
        <Card>
          <CardHeader>
            <CardTitle level={4}>Clear by default</CardTitle>
          </CardHeader>
          <CardContent>Less searching, more doing.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={4}>Room to grow</CardTitle>
          </CardHeader>
          <CardContent>Start small and keep your options.</CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ComponentSpecimen({ state }: { state: InspectionState }) {
  const [count, setCount] = useState(0)
  const group = useId()
  const disabled = state === 'disabled'
  return (
    <div className="workshop-stack">
      <h3>Everyday components</h3>
      <div className="workshop-actions">
        <Button
          disabled={disabled}
          pending={state === 'pending'}
          onClick={() => setCount(n => n + 1)}
        >
          Try the action
        </Button>
        <Button
          variant="outline"
          tone="neutral"
        >
          Secondary action
        </Button>
        <Link href="#content">Back to the workshop heading</Link>
      </div>
      <output>Action activated {count} times.</output>
      <section
        aria-label="Control size comparison"
        className="workshop-size-grid"
      >
        {(['small', 'medium', 'large'] as const).map(size => (
          <div
            className="workshop-stack"
            key={size}
          >
            <h4>{size} controls</h4>
            <Button
              controlSize={size}
              disabled={disabled}
              pending={state === 'pending'}
            >
              {size} action
            </Button>
            <Field
              label={`${size} input`}
              disabled={disabled}
              error={state === 'invalid' ? 'Check this value.' : undefined}
            >
              <Input
                controlSize={size}
                placeholder={`${size} control`}
              />
            </Field>
            <Checkbox
              controlSize={size}
              label={`${size} selection`}
              disabled={disabled}
              defaultChecked
            />
          </div>
        ))}
      </section>
      <Field
        label="Project name"
        error={state === 'invalid' ? 'Enter a project name.' : undefined}
        disabled={disabled}
      >
        <Input placeholder="A new beginning" />
      </Field>
      <Checkbox
        label="Keep me informed"
        defaultChecked
        disabled={disabled}
      />
      <RadioGroup
        label="Delivery"
        name={group}
        defaultValue="weekly"
        disabled={disabled}
      >
        <Radio
          label="Weekly"
          value="weekly"
        />
        <Radio
          label="Monthly"
          value="monthly"
        />
      </RadioGroup>
      <Accordion defaultValue="details">
        <AccordionItem value="details">
          <AccordionTrigger level={4}>Project details</AccordionTrigger>
          <AccordionContent>Content follows the same theme as its trigger.</AccordionContent>
        </AccordionItem>
      </Accordion>
      <Collapsible>
        <CollapsibleTrigger>Additional notes</CollapsibleTrigger>
        <CollapsibleContent>Disclosure state belongs to this specimen.</CollapsibleContent>
      </Collapsible>
      <Dialog>
        <DialogTrigger>Inspect overlay</DialogTrigger>
        <DialogContent>
          <DialogTitle>Review the surface</DialogTitle>
          <DialogDescription>
            Check the panel, backdrop and keyboard focus in the current mode.
          </DialogDescription>
          <DialogClose>Close inspection</DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}
