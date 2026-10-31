'use client'
import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselViewport,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
  CarouselAutoPlay,
  Field,
  Textarea,
  type CarouselProps
} from '@cognitap/radiant'
export type CarouselTaskOptions = Pick<
  CarouselProps,
  'dir' | 'autoPlay' | 'interval' | 'className' | 'style'
>
const studies = [
  {
    value: 'atlas',
    title: 'Atlas onboarding',
    description: 'Compare the first steps people take when joining a research workspace.',
    participants: 24
  },
  {
    value: 'harbor',
    title: 'Harbor reading',
    description: 'Explore passage length, text size and recall after reading.',
    participants: 18
  },
  {
    value: 'orchard',
    title: 'Orchard navigation',
    description: 'Observe how people find sessions and recover from a missed destination.',
    participants: 12
  }
]
function Controls() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <CarouselPrevious
          variant="outline"
          tone="neutral"
        >
          Previous study
        </CarouselPrevious>
        <CarouselNext
          variant="outline"
          tone="neutral"
        >
          Next study
        </CarouselNext>
        <CarouselAutoPlay
          variant="ghost"
          tone="neutral"
        />
      </div>
      <CarouselIndicators />
    </>
  )
}
export function ReviewStudyLibrary(options: CarouselTaskOptions) {
  const [opened, setOpened] = useState('')
  return (
    <section
      className="grid w-full max-w-2xl gap-4"
      aria-label="Study library application"
    >
      <h2>Choose a study to review</h2>
      <Carousel
        {...options}
        aria-label="Research studies"
        items={studies.map(study => ({
          value: study.value,
          label: study.title,
          children: (
            <Card>
              <CardHeader>
                <CardTitle>{study.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{study.description}</p>
                <p>{study.participants} participants</p>
                <Button onClick={() => setOpened(study.title)}>Review {study.title}</Button>
              </CardContent>
            </Card>
          )
        }))}
      >
        <CarouselViewport />
        <Controls />
      </Carousel>
      <output aria-label="Study review feedback">
        {opened ? `${opened} opened for review.` : 'Choose a study to begin.'}
      </output>
      {opened && (
        <article aria-label="Selected study">
          <h3>{opened}</h3>
          <p>
            Review consent, session notes and participant preferences before scheduling the next
            round.
          </p>
        </article>
      )}
    </section>
  )
}
export function PrepareStudyNotes(options: CarouselTaskOptions) {
  const [notes, setNotes] = useState<Record<string, string>>({}),
    [saved, setSaved] = useState('')
  return (
    <section
      className="grid w-full max-w-2xl gap-4"
      aria-label="Study preparation application"
    >
      <h2>Prepare the next research round</h2>
      <Carousel
        {...options}
        aria-label="Study preparation"
        items={studies.map(study => ({
          value: study.value,
          label: study.title,
          children: (
            <Card>
              <CardHeader>
                <CardTitle>{study.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{study.description}</p>
                <form
                  className="grid gap-3"
                  onSubmit={event => {
                    event.preventDefault()
                    setSaved(`Preparation saved for ${study.title}: ${notes[study.value] ?? ''}`)
                  }}
                >
                  <Field label={`Notes for ${study.title}`}>
                    <Textarea
                      name="notes"
                      value={notes[study.value] ?? ''}
                      onChange={event =>
                        setNotes({ ...notes, [study.value]: event.currentTarget.value })
                      }
                    />
                  </Field>
                  <Button type="submit">Save {study.title} preparation</Button>
                </form>
              </CardContent>
            </Card>
          )
        }))}
      >
        <CarouselViewport />
        <Controls />
      </Carousel>
      <output aria-label="Preparation feedback">{saved}</output>
    </section>
  )
}
export function CompareResearchRounds(options: CarouselTaskOptions) {
  const [value, setValue] = useState<string | null>('atlas'),
    [locked, setLocked] = useState(false),
    [feedback, setFeedback] = useState('')
  return (
    <section
      className="grid w-full max-w-2xl gap-4"
      aria-label="Research comparison application"
    >
      <h2>Compare research rounds</h2>
      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={locked}
          onChange={event => setLocked(event.target.checked)}
        />
        Keep the selected study
      </label>
      <Carousel
        {...options}
        aria-label="Research comparison"
        value={value}
        onValueChange={next => {
          if (locked) {
            setFeedback('The selected study is locked.')
            return
          }
          setValue(next)
          setFeedback('Research comparison updated.')
        }}
        items={studies.map(study => ({
          value: study.value,
          label: study.title,
          children: (
            <Card>
              <CardHeader>
                <CardTitle>{study.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{study.description}</p>
                <dl>
                  <dt>Participants</dt>
                  <dd>{study.participants}</dd>
                  <dt>Review status</dt>
                  <dd>Ready for comparison</dd>
                </dl>
              </CardContent>
            </Card>
          )
        }))}
      >
        <CarouselViewport />
        <Controls />
      </Carousel>
      <output aria-label="Comparison feedback">{feedback}</output>
    </section>
  )
}
