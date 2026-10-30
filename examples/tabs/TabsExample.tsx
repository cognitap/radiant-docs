'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type ControlSize
} from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'

export type TabsTask = 'workspace' | 'reports' | 'account' | 'stages'
type Presentation = { controlSize?: ControlSize; dir?: 'ltr' | 'rtl' }

export function TabsExample({ task = 'workspace', ...props }: Presentation & { task?: TabsTask }) {
  return task === 'reports' ? (
    <Reports {...props} />
  ) : task === 'account' ? (
    <Account {...props} />
  ) : task === 'stages' ? (
    <Stages {...props} />
  ) : (
    <Workspace {...props} />
  )
}

function Workspace(props: Presentation) {
  const ready = useHydrated()
  const [section, setSection] = useState('general')
  const [feedback, setFeedback] = useState('No changes saved')
  return (
    <Card style={{ maxWidth: '40rem', minWidth: 0 }}>
      <CardHeader>
        <CardTitle>Your workspace, your way</CardTitle>
        <CardDescription>A few details that make a place feel like yours.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          aria-label="Workspace settings"
          style={{ display: 'grid', gap: '1.5rem', minWidth: 0 }}
          onSubmit={event => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            setFeedback(
              `Saved locally: ${data.get('workspace')}; desktop notifications ${data.has('desktop') ? 'on' : 'off'}.`
            )
          }}
          onReset={() => setFeedback('Preferences reset')}
        >
          <Tabs
            {...props}
            value={section}
            disabled={!ready}
            onValueChange={setSection}
          >
            <TabsList aria-label="Workspace settings sections">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <TabsContent
              value="general"
              keepMounted
            >
              <Field
                label="Workspace name"
                description="The name your team sees."
              >
                <Input
                  name="workspace"
                  defaultValue="Studio"
                />
              </Field>
            </TabsContent>
            <TabsContent
              value="notifications"
              keepMounted
            >
              <Field
                label="Desktop notifications"
                description="Show a notification when someone mentions you."
                style={{ gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center' }}
                parts={{ description: { style: { gridColumn: '1 / -1' } } }}
              >
                <Switch
                  name="desktop"
                  value="enabled"
                  defaultChecked
                />
              </Field>
            </TabsContent>
            <TabsContent
              value="members"
              keepMounted
            >
              <p>Good work is better together.</p>
              <Button
                variant="outline"
                tone="neutral"
                disabled={!ready}
                onClick={() => setFeedback('Invitation flow opened locally')}
              >
                Invite a teammate
              </Button>
            </TabsContent>
          </Tabs>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
            <Button
              type="submit"
              disabled={!ready}
            >
              Save preferences
            </Button>
            <Button
              type="reset"
              disabled={!ready}
              variant="outline"
              tone="neutral"
            >
              Reset preferences
            </Button>
          </div>
          <output style={{ overflowWrap: 'anywhere' }}>{feedback}</output>
        </form>
      </CardContent>
    </Card>
  )
}

const reports = [
  { value: 'traffic', label: 'Traffic', summary: '12,480 visits this week, up 8%.' },
  { value: 'revenue', label: 'Revenue', summary: '$18,200 this week from 214 orders.' },
  { value: 'retention', label: 'Retention', summary: "61% of last month's visitors returned." }
]

function Reports(props: Presentation) {
  const [loads, setLoads] = useState(0)
  return (
    <div style={{ display: 'grid', gap: '.75rem', width: '28rem', maxWidth: '100%' }}>
      <Tabs
        {...props}
        defaultValue="traffic"
        activationMode="manual"
        onValueChange={() => setLoads(count => count + 1)}
      >
        <TabsList aria-label="Weekly reports">
          {reports.map(report => (
            <TabsTrigger
              key={report.value}
              value={report.value}
            >
              {report.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {reports.map(report => (
          <TabsContent
            key={report.value}
            value={report.value}
          >
            {report.summary}
          </TabsContent>
        ))}
      </Tabs>
      <output>Reports loaded after the first: {loads}</output>
    </div>
  )
}

function Account(props: Presentation) {
  return (
    <Tabs
      {...props}
      defaultValue="profile"
      orientation="vertical"
      style={{ width: '32rem', maxWidth: '100%' }}
    >
      <TabsList aria-label="Account settings">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">Your name and photo appear on shared projects.</TabsContent>
      <TabsContent value="security">Two-step sign-in is on for this account.</TabsContent>
      <TabsContent value="billing">The next invoice is due on the 1st.</TabsContent>
    </Tabs>
  )
}

const stages = ['Brief', 'Research', 'Design', 'Build', 'Review', 'Launch', 'Measure', 'Archive']

function Stages(props: Presentation) {
  return (
    <Tabs
      {...props}
      defaultValue="Brief"
      style={{ width: '20rem', maxWidth: '100%' }}
    >
      <TabsList aria-label="Project stages">
        {stages.map(stage => (
          <TabsTrigger
            key={stage}
            value={stage}
          >
            {stage}
          </TabsTrigger>
        ))}
      </TabsList>
      {stages.map(stage => (
        <TabsContent
          key={stage}
          value={stage}
        >
          Tasks for the {stage.toLowerCase()} stage.
        </TabsContent>
      ))}
    </Tabs>
  )
}
