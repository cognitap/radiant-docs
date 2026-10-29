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
  TabsTrigger
} from '@cognitap/radiant'
import { useHydrated } from '../profile/useHydrated'

export function TabsWorkspaceExample() {
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
