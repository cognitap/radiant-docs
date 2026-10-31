'use client'

import { useRef, useState, type CSSProperties } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  useAccordion
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import { useHydrated } from '../profile/useHydrated'

export type AccordionTask = 'guide' | 'multiple' | 'controlled' | 'disabled'

const frame = {
  maxWidth: '40rem',
  minWidth: 0,
  '--rad-card-padding': 'clamp(.75rem, 3vw, 1.5rem)',
  '--rad-collapsible-padding': 'clamp(.75rem, 3vw, 1.5rem)'
} as CSSProperties
const stack = { display: 'grid', gap: '1rem', minWidth: 0 } as const
const actions = { display: 'flex', flexWrap: 'wrap', gap: '.5rem' } as const
const text = { margin: 0 } as const

export function AccordionExample({
  task = 'guide',
  disabled = false
}: {
  task?: AccordionTask
  disabled?: boolean
}) {
  return (
    <div style={frame}>
      <MotionProvider>
        {task === 'multiple' ? (
          <Packing />
        ) : task === 'controlled' ? (
          <Chapters />
        ) : task === 'disabled' ? (
          <Plans disabled={disabled} />
        ) : (
          <Guide />
        )}
      </MotionProvider>
    </div>
  )
}

function CloseAnswer({ value, onClose }: { value: string; onClose: () => void }) {
  const accordion = useAccordion()
  return (
    <Button
      variant="ghost"
      tone="neutral"
      onClick={() => {
        accordion?.setItemOpen(value, false)
        onClose()
      }}
    >
      Got it
    </Button>
  )
}

function Guide() {
  const summary = useRef<HTMLElement>(null)
  return (
    <Card style={{ minWidth: 0 }}>
      <CardHeader>
        <CardTitle>Good questions. Clear answers.</CardTitle>
        <CardDescription>A small guide to making a workspace feel like yours.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion defaultValue="start">
          <AccordionItem value="start">
            <AccordionTrigger>Where should I begin?</AccordionTrigger>
            <AccordionContent>
              <div style={stack}>
                <p style={text}>Start small: one space, a thoughtful name, and room to grow.</p>
                <Field
                  label="Workspace name"
                  description="This draft stays here when you fold the answer away."
                >
                  <Input
                    name="workspace"
                    defaultValue="Studio North"
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="habits">
            <AccordionTrigger ref={summary}>How do I keep it useful?</AccordionTrigger>
            <AccordionContent>
              <div style={stack}>
                <p style={text}>Give each project a clear next step, and archive finished work.</p>
                <div style={actions}>
                  <CloseAnswer
                    value="habits"
                    onClose={() => summary.current?.focus()}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="team">
            <AccordionTrigger>Can I bring my team?</AccordionTrigger>
            <AccordionContent>
              <p style={text}>
                Yes. Invite a few collaborators and keep decisions close to the work.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

function Packing() {
  return (
    <Accordion
      type="multiple"
      defaultValue={['clothes', 'documents']}
    >
      <AccordionItem value="clothes">
        <AccordionTrigger>Clothes</AccordionTrigger>
        <AccordionContent>A rain jacket, two layers and comfortable shoes.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="documents">
        <AccordionTrigger>Documents</AccordionTrigger>
        <AccordionContent>Passport, tickets and the hotel address.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="gear">
        <AccordionTrigger>Gear</AccordionTrigger>
        <AccordionContent>Charger, adapter and a small first-aid kit.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const chapters = [
  { value: 'arrival', title: 'Arrival', body: 'Find the studio, meet the host and settle in.' },
  { value: 'workshop', title: 'Workshop', body: 'Two hours of hands-on practice in pairs.' },
  { value: 'review', title: 'Review', body: 'Share one thing you made and one you would change.' }
]

function Chapters() {
  const ready = useHydrated()
  const [open, setOpen] = useState<string | null>('arrival')
  const index = chapters.findIndex(chapter => chapter.value === open)
  return (
    <div style={stack}>
      <Accordion
        value={open}
        onValueChange={setOpen}
      >
        {chapters.map(chapter => (
          <AccordionItem
            key={chapter.value}
            value={chapter.value}
          >
            <AccordionTrigger>{chapter.title}</AccordionTrigger>
            <AccordionContent>{chapter.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div style={actions}>
        <Button
          variant="outline"
          tone="neutral"
          disabled={!ready || index === chapters.length - 1}
          onClick={() => setOpen(chapters[index + 1]?.value ?? chapters[0].value)}
        >
          Next chapter
        </Button>
        <Button
          variant="ghost"
          tone="neutral"
          disabled={!ready || open === null}
          onClick={() => setOpen(null)}
        >
          Close all
        </Button>
      </div>
      <output>Open: {open ?? 'none'}</output>
    </div>
  )
}

function Plans({ disabled }: { disabled: boolean }) {
  return (
    <Accordion
      defaultValue="starter"
      disabled={disabled}
    >
      <AccordionItem value="starter">
        <AccordionTrigger>Starter</AccordionTrigger>
        <AccordionContent>One workspace and three collaborators.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="team">
        <AccordionTrigger>Team</AccordionTrigger>
        <AccordionContent>Unlimited workspaces and shared templates.</AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="enterprise"
        disabled
      >
        <AccordionTrigger>Enterprise · coming soon</AccordionTrigger>
        <AccordionContent>Single sign-on and audit logs.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
