'use client'
import { useId, useRef, useState, type MouseEvent } from 'react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
  NavigationMenuContent,
  Field,
  NativeSelect,
  Checkbox,
  type NavigationMenuProps,
  type NavigationMenuViewportProps
} from '@cognitap/radiant'

export type NavigationMenuTaskOptions = Pick<
  NavigationMenuProps,
  'controlSize' | 'disabled' | 'dir' | 'openDelay' | 'closeDelay' | 'className' | 'style'
> &
  Pick<NavigationMenuViewportProps, 'motion' | 'sideOffset'> & { instanceLabel?: string }
type Page = { key: string; title: string; body: string; detail: string }
type Section = { key: string; title: string; pages: Page[] }
const library: Section[] = [
  {
    key: 'studies',
    title: 'Studies',
    pages: [
      {
        key: 'reading',
        title: 'Reading comprehension',
        body: 'Compare recall after reading a short passage. Begin with the consent script, then record answers without prompting.',
        detail: '15 minutes · Individual session'
      },
      {
        key: 'navigation',
        title: 'Navigation study',
        body: 'Ask participants to find a recent session and explain the route they chose. Record the first destination and any recovery steps.',
        detail: '20 minutes · Moderated session'
      },
      {
        key: 'accessibility',
        title: 'Accessible text study',
        body: 'Let participants choose their text size and contrast before they read. Save their preferences with the session notes.',
        detail: '25 minutes · Participant preferences'
      }
    ]
  },
  {
    key: 'resources',
    title: 'Resources',
    pages: [
      {
        key: 'consent',
        title: 'Participant consent',
        body: 'Explain the research purpose, recording choices and right to stop. Confirm consent before beginning the study.',
        detail: 'Required before each session'
      },
      {
        key: 'notes',
        title: 'Interview note template',
        body: 'Separate observations from interpretations. Quote participants accurately and mark uncertain notes for follow-up.',
        detail: 'Reusable session preparation'
      },
      {
        key: 'report',
        title: 'Research report',
        body: 'Group findings by participant goal. Link each finding to its observation and describe the next question to investigate.',
        detail: 'Share after synthesis'
      }
    ]
  }
]
const help: Section[] = [
  {
    key: 'guides',
    title: 'Guides',
    pages: [
      {
        key: 'first',
        title: 'Run your first study',
        body: 'Choose a research question, recruit one participant and rehearse your tasks. Start small enough to review the notes the same day.',
        detail: 'For new researchers'
      },
      {
        key: 'share',
        title: 'Share session results',
        body: 'Review consent before sharing. Remove identifying details and include the task context alongside each observation.',
        detail: 'For every team'
      },
      {
        key: 'compare',
        title: 'Compare research rounds',
        body: 'Keep the task and recruitment criteria stable. Track which product changes each round was intended to investigate.',
        detail: 'For experienced researchers'
      }
    ]
  },
  {
    key: 'support',
    title: 'Support',
    pages: [
      {
        key: 'contact',
        title: 'Contact the research team',
        body: 'Include the study identifier and a brief description of the issue. Leave participant names and recordings out of support requests.',
        detail: 'research@example.test'
      },
      {
        key: 'privacy',
        title: 'Recording and privacy',
        body: 'Use only recordings covered by consent. Restrict access to the study team and follow the project retention schedule.',
        detail: 'Review before recording'
      }
    ]
  }
]
const workspace: Section[] = [
  {
    key: 'projects',
    title: 'Projects',
    pages: [
      {
        key: 'atlas',
        title: 'Atlas onboarding',
        body: 'Review three completed onboarding sessions. The next round investigates whether new participants can recover from an incomplete profile.',
        detail: '3 sessions · Next round: profile recovery'
      },
      {
        key: 'harbor',
        title: 'Harbor reading',
        body: 'Review the reading-comprehension study and its prepared consent materials. Two participants requested larger text.',
        detail: '5 sessions · Next round: text preferences'
      }
    ]
  },
  {
    key: 'team',
    title: 'Team',
    pages: [
      {
        key: 'schedule',
        title: 'Research schedule',
        body: 'Reserve time for recruitment, sessions and synthesis. Leave a review slot after each interview while observations are fresh.',
        detail: 'Next session: Tuesday at 10:00'
      },
      {
        key: 'roles',
        title: 'Team responsibilities',
        body: 'The moderator leads the session. The observer records behavior and the researcher reviews consent and prepares synthesis.',
        detail: 'Moderator · Observer · Researcher'
      }
    ]
  }
]
function SiteNavigator({
  sections,
  label,
  filtered = false,
  controlled = false,
  instanceLabel,
  ...options
}: NavigationMenuTaskOptions & {
  sections: Section[]
  label: string
  filtered?: boolean
  controlled?: boolean
}) {
  const [open, setOpen] = useState<string | null>(null),
    [current, setCurrent] = useState(sections[0]!.pages[0]!),
    [audience, setAudience] = useState('all'),
    [pinned, setPinned] = useState(false),
    [feedback, setFeedback] = useState('Choose a destination to read its content.'),
    target = useRef<HTMLElement>(null),
    id = useId()
  const request = (value: string | null) => {
    if (pinned && value === null) {
      setFeedback('Keep navigation open is enabled.')
      return
    }
    setOpen(value)
  }
  const navigate = (event: MouseEvent<HTMLAnchorElement>, page: Page) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
      return
    event.preventDefault()
    setCurrent(page)
    request(null)
    setFeedback(`${page.title} opened.`)
    event.currentTarget.ownerDocument.defaultView?.requestAnimationFrame(() =>
      target.current?.focus()
    )
  }
  const { motion, sideOffset, ...rootOptions } = options
  return (
    <section
      aria-label={`${instanceLabel ?? label} application`}
      style={{ display: 'grid', gap: '1rem', width: 'min(48rem,100%)', minWidth: 0 }}
    >
      {filtered && (
        <Field label="Guide audience">
          <NativeSelect
            value={audience}
            onChange={event => setAudience(event.currentTarget.value)}
          >
            <option value="all">All researchers</option>
            <option value="new">New researchers</option>
          </NativeSelect>
        </Field>
      )}
      {controlled && (
        <Checkbox
          label="Keep navigation open"
          checked={pinned}
          onChange={event => setPinned(event.currentTarget.checked)}
        />
      )}
      <NavigationMenu
        {...rootOptions}
        aria-label={instanceLabel ?? label}
        items={sections.map(section => ({ value: section.key }))}
        value={open}
        onValueChange={request}
      >
        <NavigationMenuList>
          {sections.map(section => (
            <NavigationMenuItem key={section.key}>
              <NavigationMenuTrigger value={section.key}>{section.title}</NavigationMenuTrigger>
            </NavigationMenuItem>
          ))}
          <NavigationMenuItem>
            <NavigationMenuLink
              href={`#${id}`}
              onClick={event => navigate(event, sections[0]!.pages[0]!)}
            >
              Overview
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport
          motion={motion}
          sideOffset={sideOffset}
        >
          {sections.map(section => (
            <NavigationMenuContent
              key={section.key}
              value={section.key}
              style={{ width: section.key === sections[0]!.key ? '24rem' : '19rem' }}
            >
              <h3 style={{ margin: '0 0 0.75rem' }}>{section.title}</h3>
              <ul
                style={{
                  display: 'grid',
                  gap: '0.75rem',
                  padding: 0,
                  margin: 0,
                  listStyle: 'none'
                }}
              >
                {section.pages
                  .filter((_, index) => !filtered || audience === 'all' || index < 2)
                  .map(page => (
                    <li key={page.key}>
                      <NavigationMenuLink
                        href={`#${id}`}
                        active={current.key === page.key}
                        onClick={event => navigate(event, page)}
                      >
                        {page.title}
                      </NavigationMenuLink>
                      <p
                        style={{
                          margin: '0.125rem 0 0',
                          fontSize: '0.8125rem',
                          color: 'var(--rad-color-muted-foreground)'
                        }}
                      >
                        {page.detail}
                      </p>
                    </li>
                  ))}
              </ul>
            </NavigationMenuContent>
          ))}
        </NavigationMenuViewport>
      </NavigationMenu>
      <section
        ref={target}
        id={id}
        tabIndex={-1}
        aria-label={`${instanceLabel ?? label} destination`}
        style={{
          minHeight: '18rem',
          padding: '1.25rem',
          border: '1px solid var(--rad-color-border)',
          borderRadius: '0.5rem'
        }}
      >
        <h3 style={{ marginTop: 0 }}>{current.title}</h3>
        <p>{current.body}</p>
        <p>{current.detail}</p>
      </section>
      <output
        aria-label={`${instanceLabel ?? label} feedback`}
        aria-live="polite"
      >
        {feedback}
      </output>
    </section>
  )
}
export function NavigateResearchLibrary(options: NavigationMenuTaskOptions) {
  return (
    <SiteNavigator
      {...options}
      sections={library}
      label="Research library"
    />
  )
}
export function FindHelpResources(options: NavigationMenuTaskOptions) {
  return (
    <SiteNavigator
      {...options}
      sections={help}
      label="Research help"
      filtered
    />
  )
}
export function SwitchResearchWorkspace(options: NavigationMenuTaskOptions) {
  return (
    <SiteNavigator
      {...options}
      sections={workspace}
      label="Research workspace"
      controlled
    />
  )
}

import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
export type NavigationTask = 'library' | 'help' | 'workspace'
export function NavigationMenuExample({
  task = 'library',
  ...options
}: NavigationMenuTaskOptions & { task?: NavigationTask }) {
  return (
    <MotionProvider>
      {task === 'help' ? (
        <FindHelpResources {...options} />
      ) : task === 'workspace' ? (
        <SwitchResearchWorkspace {...options} />
      ) : (
        <NavigateResearchLibrary {...options} />
      )}
    </MotionProvider>
  )
}
