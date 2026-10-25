'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  ThemeScope,
  radiant,
  type Theme,
  type ThemeMode
} from '@cognitap/radiant'
import { NativeProfileForm } from './NativeProfileForm'
import { TanStackProfileForm } from './TanStackProfileForm'
import type { Profile } from './profile'
import '@cognitap/radiant/styles.css'
import './profile-form.css'

export type FormOwner = 'native' | 'tanstack'
export type FormPlacement = 'standalone' | 'card' | 'dialog'

export function ProfileRecipe({
  owner = 'native',
  placement = 'standalone',
  theme = radiant,
  mode = 'light'
}: {
  owner?: FormOwner
  placement?: FormPlacement
  theme?: Theme
  mode?: ThemeMode
}) {
  const [saved, setSaved] = useState<Profile | null>(null)
  const [open, setOpen] = useState(false)
  const Form = owner === 'native' ? NativeProfileForm : TanStackProfileForm
  const form = (
    <Form
      key={owner}
      onSave={profile => {
        setSaved(profile)
        setOpen(false)
      }}
      onReset={() => setSaved(null)}
    />
  )

  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="profile-recipe"
    >
      <div className="profile-recipe-inner">
        {placement === 'standalone' ? (
          form
        ) : placement === 'card' ? (
          <Card>
            <CardHeader>
              <CardTitle level={3}>Your profile</CardTitle>
              <CardDescription>Choose how you appear and stay in touch.</CardDescription>
            </CardHeader>
            <CardContent>{form}</CardContent>
          </Card>
        ) : (
          <Dialog
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger>Edit profile</DialogTrigger>
            <DialogContent>
              <DialogTitle>Edit your profile</DialogTitle>
              <DialogDescription>
                Save your changes, or close to keep editing later.
              </DialogDescription>
              {form}
              <DialogClose variant="ghost">Close editor</DialogClose>
            </DialogContent>
          </Dialog>
        )}
        <output className="profile-result">
          {saved ? (
            <>
              Saved locally for {saved.displayName}: {saved.email}. Contact:{' '}
              {saved.contact === 'email' ? 'email' : 'none'}. Product updates:{' '}
              {saved.updates ? 'on' : 'off'}.
            </>
          ) : (
            'Changes stay in this demo. Nothing is sent to a server.'
          )}
        </output>
      </div>
    </ThemeScope>
  )
}
